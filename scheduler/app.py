from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import copy

app = Flask(__name__)
CORS(app)

# ============================================================
# SOLVER CONFIG
# ============================================================
def load_config():
    with open('config.json') as f:
        return json.load(f)

# ============================================================
# 3-WAVE BRANCH SOLVER
# ============================================================
class BranchSolver:
    """
    Solves timetables for an entire branch (multiple years + sections).
    Uses a 3-wave approach:
      Wave 1: Place Fixed Classes (OE, etc.) — non-negotiable
      Wave 2: Place Alternate Classes (Mentor/Sports rotation)
      Wave 3: Backtrack Normal Classes into remaining gaps
    """

    def __init__(self, faculties, rooms, subject_mappings, fixed_classes,
                 alternate_classes, resource_caps, years, sections, section_halls, config):
        self.faculties = faculties
        self.rooms = rooms
        self.subject_mappings = subject_mappings
        self.fixed_classes = fixed_classes
        self.alternate_classes = alternate_classes
        self.resource_caps = resource_caps
        self.years = years
        self.sections = sections
        self.section_halls = section_halls or {}
        self.config = config
        self.days = config['schedule']['days']
        self.slots = [s for s in config['schedule']['slots'] if not s['is_break']]
        self.global_fixed = config['schedule'].get('fixed_sessions', [])

        # Valid lab start positions (2 consecutive slots, must NOT cross lunch)
        # First half: slot 0+1, 1+2  |  Second half: slot 3+4, 4+5
        # Slot 2+3 is FORBIDDEN (crosses lunch break)
        self.VALID_LAB_STARTS = [0, 1, 3, 4]

        # Grid: { "Y3-A": [list of slot assignments], ... }
        self.grids = {}
        for y in years:
            for sec in sections:
                self.grids[f"Y{y}-{sec}"] = []

        # Global resource tracker: tracks which rooms are used per (day, slot_idx)
        self.room_usage = {}  # (day, slot_idx) -> set of roomIds
        # Global faculty tracker: tracks faculty busy per (day, slot_idx)
        self.faculty_usage = {}  # (day, slot_idx) -> set of faculty names

    def _get_key(self, day, slot_idx):
        return f"{day}_{slot_idx}"

    def _is_room_free(self, day, slot_idx, room_id):
        key = self._get_key(day, slot_idx)
        return room_id not in self.room_usage.get(key, set())

    def _is_faculty_free(self, day, slot_idx, faculty_name):
        key = self._get_key(day, slot_idx)
        return faculty_name not in self.faculty_usage.get(key, set())

    def _reserve(self, day, slot_idx, room_id, faculty_name):
        key = self._get_key(day, slot_idx)
        self.room_usage.setdefault(key, set()).add(room_id)
        if faculty_name:
            self.faculty_usage.setdefault(key, set()).add(faculty_name)

    def _release(self, day, slot_idx, room_id, faculty_name):
        key = self._get_key(day, slot_idx)
        self.room_usage.get(key, set()).discard(room_id)
        if faculty_name:
            self.faculty_usage.get(key, set()).discard(faculty_name)

    def _is_global_fixed(self, day, slot_idx):
        """Check if this slot is a global fixed session (config.json level)."""
        for fs in self.global_fixed:
            if fs['day'] == day and fs['slot_idx'] == slot_idx:
                return fs
        return None

    # ========================================================
    # WAVE 1: Fixed Classes
    # ========================================================
    def wave1_fixed(self):
        """Place fixed classes. These are absolute anchors."""
        for fc in self.fixed_classes:
            subject = fc.get('subject', 'Fixed Class')
            room = fc.get('room', '')
            target_years = fc.get('years', self.years)
            target_sections = fc.get('sections', ['ALL'])
            base_faculty = fc.get('faculty', '')

            # Support for multiple slots per fixed class
            slots_to_fix = fc.get('slots', [])
            if not slots_to_fix and 'day' in fc:
                slots_to_fix = [{'day': fc['day'], 'slot_idx': fc.get('slot_idx', 0)}]

            for s in slots_to_fix:
                day = s['day']
                slot_idx = int(s.get('slot_idx', 0))

                for y in target_years:
                    for sec in self.sections:
                        if 'ALL' in target_sections or sec in target_sections:
                            grid_key = f"Y{y}-{sec}"
                            if grid_key in self.grids:
                                # Dynamically map the correct faculty for this specific section
                                section_faculty = base_faculty
                                if 'ALL' in target_sections:
                                    for m in self.subject_mappings:
                                        if m['subject'] == subject and m.get('year') == y and m.get('section') == sec:
                                            section_faculty = m['faculty']
                                            break

                                entry = {
                                    'day': day, 'slot_idx': slot_idx,
                                    'subject': subject, 'faculty': section_faculty,
                                    'room': room, 'type': 'Fixed',
                                    'year': y, 'section': sec
                                }
                                self.grids[grid_key].append(entry)
                                if room and section_faculty:
                                    self._reserve(day, slot_idx, room, section_faculty)

    # ========================================================
    # WAVE 2: Alternate Classes
    # ========================================================
    def wave2_alternates(self):
        """Place alternate classes with rotation logic."""
        for alt in self.alternate_classes:
            day = alt.get('day')
            slot_idx = alt.get('slot_idx', alt.get('slotIdx', 0))
            subject_a = alt.get('subjectA', 'Activity A')
            subject_b = alt.get('subjectB', 'Activity B')
            section_for_a = alt.get('sectionForA', 'A')
            section_for_b = alt.get('sectionForB', 'B')
            target_years = alt.get('years', self.years)

            for y in target_years:
                for sec in self.sections:
                    grid_key = f"Y{y}-{sec}"
                    if grid_key not in self.grids:
                        continue

                    if sec == section_for_a:
                        subject = subject_a
                    elif sec == section_for_b:
                        subject = subject_b
                    else:
                        subject = subject_a  # Default

                    entry = {
                        'day': day, 'slot_idx': slot_idx,
                        'subject': subject, 'faculty': '',
                        'room': '', 'type': 'Alternate',
                        'year': y, 'section': sec
                    }
                    self.grids[grid_key].append(entry)

    # ========================================================
    # WAVE 3: Normal Classes (Backtracking)
    # ========================================================
    def _is_slot_taken(self, grid_key, day, slot_idx):
        """Check if a slot is already occupied in a specific grid."""
        for entry in self.grids[grid_key]:
            if entry['day'] == day and entry['slot_idx'] == slot_idx:
                return True
        # Also check global fixed sessions
        if self._is_global_fixed(day, slot_idx):
            return True
        return False

    def _count_weekly_hours(self, grid_key, subject, faculty):
        """Count how many hours a subject already has in a grid."""
        return sum(1 for e in self.grids[grid_key]
                   if e['subject'] == subject and e['faculty'] == faculty)

    def _get_daily_faculty_load(self, grid_key, day, faculty):
        """Count faculty hours on a specific day in a grid."""
        return sum(1 for e in self.grids[grid_key]
                   if e['day'] == day and e['faculty'] == faculty)

    def _count_daily_labs(self, grid_key, day):
        """Count how many distinct lab sessions are on a given day in a grid."""
        lab_subjects = set()
        for e in self.grids[grid_key]:
            if e['day'] == day and e['type'] == 'Lab':
                lab_subjects.add(e['subject'])
        return len(lab_subjects)

    def _count_active_sessions(self, day, slot_idx, session_type):
        """Count how many sessions of a specific type are running globally at the same time."""
        count = 0
        for grid in self.grids.values():
            for e in grid:
                if e['day'] == day and e['slot_idx'] == slot_idx and e['type'] == session_type:
                    count += 1
        return count

    def wave3_normals(self):
        """Use backtracking to fill remaining normal subjects."""
        # Build the task list: for each year/section, figure out which subjects
        # still need how many hours
        tasks = []
        for mapping in self.subject_mappings:
            year = mapping.get('year')
            section = mapping.get('section', 'A')
            grid_key = f"Y{year}-{section}"
            if grid_key not in self.grids:
                continue

            weekly_hours = mapping.get('weeklyHours', 3)
            already_placed = self._count_weekly_hours(grid_key, mapping['subject'], mapping['faculty'])
            remaining = weekly_hours - already_placed

            for _ in range(remaining):
                tasks.append({
                    'grid_key': grid_key,
                    'subject': mapping['subject'],
                    'faculty': mapping['faculty'],
                    'type': mapping.get('type', 'Lecture'),
                    'year': year,
                    'section': section
                })

        # Shuffle tasks for variety
        random.shuffle(tasks)

        # Attempt backtracking placement
        success = self._backtrack(tasks, 0)
        return success

    def _backtrack(self, tasks, idx):
        """Recursive backtracking solver for normal classes."""
        if idx == len(tasks):
            return True  # All placed!

        task = tasks[idx]
        grid_key = task['grid_key']
        faculty = task['faculty']
        course_type = task['type']

        # Get compatible rooms
        compatible_rooms = []
        fixed_hall = getattr(self, 'section_halls', {}).get(grid_key, '')

        for r in self.rooms:
            r_id = r.get('roomId', r.get('_id', ''))
            r_type = r.get('type', '')
            if course_type == 'Lab' and r_type not in ('Computer Lab', 'Specialized Lab'):
                continue
            if course_type == 'Lecture' and r_type in ('Computer Lab', 'Specialized Lab'):
                continue
            
            # Enforce fixed lecture hall for this section if set
            if course_type == 'Lecture' and fixed_hall and r_id != fixed_hall:
                continue

            compatible_rooms.append(r)

        shuffled_days = list(self.days)
        random.shuffle(shuffled_days)

        for day in shuffled_days:
            # Faculty daily load check
            if self._get_daily_faculty_load(grid_key, day, faculty) >= 4:
                continue

            for s_idx in range(len(self.slots)):
                # Skip if slot is already taken
                if self._is_slot_taken(grid_key, day, s_idx):
                    continue

                # Check branch-wide Resource Caps
                active_count = self._count_active_sessions(day, s_idx, course_type)
                if course_type == 'Lecture':
                    if active_count >= self.resource_caps.get('lectureHalls', 5):
                        continue
                elif course_type == 'Lab':
                    if active_count >= self.resource_caps.get('labs', 3):
                        continue

                # Faculty global availability check
                if not self._is_faculty_free(day, s_idx, faculty):
                    continue

                for room in compatible_rooms:
                    r_id = room.get('roomId', room.get('_id', ''))

                    if not self._is_room_free(day, s_idx, r_id):
                        continue

                    if course_type == 'Lab':
                        # Constraint: Labs only in first half or second half (no crossing lunch)
                        if s_idx not in self.VALID_LAB_STARTS:
                            continue

                        # Constraint: Max one lab per day per section
                        if self._count_daily_labs(grid_key, day) >= 1:
                            continue

                        # Labs need 2 consecutive slots
                        if s_idx + 1 >= len(self.slots):
                            continue
                        if self._is_slot_taken(grid_key, day, s_idx + 1):
                            continue
                        if not self._is_faculty_free(day, s_idx + 1, faculty):
                            continue
                        if not self._is_room_free(day, s_idx + 1, r_id):
                            continue

                        # Place lab (2 slots)
                        e1 = {'day': day, 'slot_idx': s_idx, 'subject': task['subject'],
                               'faculty': faculty, 'room': r_id, 'type': 'Lab',
                               'year': task['year'], 'section': task['section']}
                        e2 = {'day': day, 'slot_idx': s_idx + 1, 'subject': task['subject'],
                               'faculty': faculty, 'room': r_id, 'type': 'Lab',
                               'year': task['year'], 'section': task['section']}
                        self.grids[grid_key].append(e1)
                        self.grids[grid_key].append(e2)
                        self._reserve(day, s_idx, r_id, faculty)
                        self._reserve(day, s_idx + 1, r_id, faculty)

                        if self._backtrack(tasks, idx + 1):
                            return True

                        # Backtrack
                        self.grids[grid_key].pop()
                        self.grids[grid_key].pop()
                        self._release(day, s_idx, r_id, faculty)
                        self._release(day, s_idx + 1, r_id, faculty)
                    else:
                        # Place lecture
                        entry = {'day': day, 'slot_idx': s_idx, 'subject': task['subject'],
                                 'faculty': faculty, 'room': r_id, 'type': 'Lecture',
                                 'year': task['year'], 'section': task['section']}
                        self.grids[grid_key].append(entry)
                        self._reserve(day, s_idx, r_id, faculty)

                        if self._backtrack(tasks, idx + 1):
                            return True

                        # Backtrack
                        self.grids[grid_key].pop()
                        self._release(day, s_idx, r_id, faculty)

        return False  # No valid placement found

    def _build_bottleneck(self, tasks, placed_count):
        """Generate a bottleneck analysis when the solver fails."""
        total = len(tasks)
        unplaced = tasks[placed_count:] if placed_count < total else []
        subjects_stuck = list(set(t['subject'] for t in unplaced))
        faculties_stuck = list(set(t['faculty'] for t in unplaced))
        total_slots = len(self.days) * len(self.slots)

        return {
            'totalTasks': total,
            'placed': placed_count,
            'unplaced': total - placed_count,
            'stuckSubjects': subjects_stuck,
            'stuckFaculty': faculties_stuck,
            'totalAvailableSlots': total_slots,
            'suggestion': f"Try reducing weekly hours or adding more rooms. {len(subjects_stuck)} subjects couldn't be placed."
        }

    # ========================================================
    # MAIN SOLVE
    # ========================================================
    def solve(self):
        """Run the 3-wave solve and inject global fixed sessions."""
        # Inject global fixed sessions into all grids
        for grid_key in self.grids:
            for fs in self.global_fixed:
                entry = {
                    'day': fs['day'], 'slot_idx': fs['slot_idx'],
                    'subject': fs['subject'], 'faculty': '',
                    'room': '', 'type': fs.get('type', 'Special')
                }
                self.grids[grid_key].append(entry)

        # Wave 1
        self.wave1_fixed()

        # Wave 2
        self.wave2_alternates()

        # Wave 3
        success = self.wave3_normals()

        if success:
            return {'status': 'success', 'data': self.grids}
        else:
            # Count how many were placed vs total
            placed = sum(len(g) for g in self.grids.values())
            tasks_total = sum(m.get('weeklyHours', 3) for m in self.subject_mappings)
            bottleneck = self._build_bottleneck(
                [{'subject': m['subject'], 'faculty': m['faculty']} for m in self.subject_mappings],
                placed
            )
            return {'status': 'error', 'message': 'Could not place all classes.', 'bottleneck': bottleneck}


# ============================================================
# LEGACY SINGLE-SECTION SOLVER (kept for backward compat)
# ============================================================
class TimetableSolver:
    def __init__(self, faculties, rooms, courses, config):
        self.faculties = faculties
        self.rooms = rooms
        self.courses = courses
        self.config = config
        self.days = config['schedule']['days']
        self.slots = [s for s in config['schedule']['slots'] if not s['is_break']]
        self.fixed_sessions = config['schedule'].get('fixed_sessions', [])
        self.VALID_LAB_STARTS = [0, 1, 3, 4]  # No crossing lunch break

    def is_consistent(self, assignment, course, day, slot_idx, room):
        for fs in self.fixed_sessions:
            if fs['day'] == day and fs['slot_idx'] == slot_idx:
                return False

        faculty_meta = next((f for f in self.faculties if f['name'] == course['faculty']), None)

        if faculty_meta and 'availability' in faculty_meta:
            day_short = day[:3]
            if not faculty_meta['availability'].get(day_short, True):
                return False

        daily_hours = sum(1 for a in assignment if a['day'] == day and a['faculty'] == course['faculty'])
        if faculty_meta and daily_hours >= faculty_meta.get('maxDailyLoad', 5):
            return False

        for a in assignment:
            if a['day'] == day and a['slot_idx'] == slot_idx:
                if a['faculty'] == course['faculty']:
                    return False
                if a['room'] == room['roomId']:
                    return False

        if room['capacity'] < course.get('min_capacity', 0):
            return False

        return True

    def solve(self, course_idx=0, assignment=None):
        if assignment is None:
            assignment = []
        if course_idx == len(self.courses):
            return assignment

        course = self.courses[course_idx]
        shuffled_days = list(self.days)
        random.shuffle(shuffled_days)

        for day in shuffled_days:
            for s_idx, slot in enumerate(self.slots):
                for room in self.rooms:
                    if course['type'] == 'Lab' and room['type'] != 'Computer Lab':
                        continue
                    if course['type'] == 'Lecture' and room['type'] == 'Computer Lab':
                        continue

                    if self.is_consistent(assignment, course, day, s_idx, room):
                        if course['type'] == 'Lab':
                            # Lab half-day constraint
                            if s_idx not in self.VALID_LAB_STARTS:
                                continue
                            # Max one lab per day
                            daily_labs = set(a['subject'] for a in assignment if a['day'] == day and a['type'] == 'Lab')
                            if len(daily_labs) >= 1:
                                continue
                            if s_idx + 1 >= len(self.slots) or not self.is_consistent(assignment, course, day, s_idx + 1, room):
                                continue
                            assignment.append({'day': day, 'slot_idx': s_idx, 'subject': course['subject'], 'faculty': course['faculty'], 'room': room['roomId'], 'type': 'Lab'})
                            assignment.append({'day': day, 'slot_idx': s_idx+1, 'subject': course['subject'], 'faculty': course['faculty'], 'room': room['roomId'], 'type': 'Lab'})
                        else:
                            assignment.append({'day': day, 'slot_idx': s_idx, 'subject': course['subject'], 'faculty': course['faculty'], 'room': room['roomId'], 'type': 'Lecture'})

                        result = self.solve(course_idx + 1, assignment)
                        if result:
                            return result

                        if course['type'] == 'Lab':
                            assignment.pop()
                            assignment.pop()
                        else:
                            assignment.pop()

        return None


# ============================================================
# API ROUTES
# ============================================================

@app.route('/api/generate', methods=['POST'])
def generate():
    """Legacy single-section endpoint."""
    data = request.json
    faculties = data.get('faculties', [])
    rooms = data.get('rooms', [])
    courses = data.get('courses', [])

    config = load_config()
    solver = TimetableSolver(faculties, rooms, courses, config)
    solution = solver.solve()

    if solution:
        final_data = solution + config['schedule'].get('fixed_sessions', [])
        return jsonify({"status": "success", "data": final_data})
    else:
        return jsonify({"status": "error", "message": "No valid schedule could be generated with given constraints"}), 400


@app.route('/api/generate-branch', methods=['POST'])
def generate_branch():
    """Multi-year, multi-section branch solver."""
    data = request.json
    faculties = data.get('faculties', [])
    rooms = data.get('rooms', [])
    subject_mappings = data.get('subjectMappings', [])
    fixed_classes = data.get('fixedClasses', [])
    alternate_classes = data.get('alternateClasses', [])
    resource_caps = data.get('resourceCaps', {})
    years = data.get('years', [2, 3, 4])
    sections = data.get('sections', ['A'])
    section_halls = data.get('sectionHalls', {})

    config = load_config()

    solver = BranchSolver(
        faculties, rooms, subject_mappings, fixed_classes,
        alternate_classes, resource_caps, years, sections, section_halls, config
    )

    result = solver.solve()
    return jsonify(result)


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "engine": "AcadPlan CSP 3-Wave Solver"})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
