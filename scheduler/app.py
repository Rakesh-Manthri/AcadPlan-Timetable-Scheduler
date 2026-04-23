from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

class TimetableSolver:
    def __init__(self, faculties, rooms, courses, config):
        self.faculties = faculties
        self.rooms = rooms
        self.courses = courses
        self.config = config
        self.days = config['schedule']['days']
        self.slots = [s for s in config['schedule']['slots'] if not s['is_break']]
        self.fixed_sessions = config['schedule'].get('fixed_sessions', [])
        self.timetable = []

    def is_consistent(self, assignment, course, day, slot_idx, room):
        # 0. Fixed Session check (Don't overwrite Mentor/Sports/Breaks)
        for fs in self.fixed_sessions:
            if fs['day'] == day and fs['slot_idx'] == slot_idx:
                return False
        faculty_meta = next((f for f in self.faculties if f['name'] == course['faculty']), None)
        
        # 1. Individual Faculty Availability Check
        if faculty_meta and 'availability' in faculty_meta:
            # We map "Mon", "Tue" etc. to the day names in our days list
            day_short = day[:3]
            if not faculty_meta['availability'].get(day_short, True):
                return False

        # 2. Faculty Load Bound (Daily constraint)
        daily_hours = sum(1 for a in assignment if a['day'] == day and a['faculty'] == course['faculty'])
        if faculty_meta and daily_hours >= faculty_meta.get('maxDailyLoad', 5): # Default 5 hrs/day max
            return False

        # 3. Faculty busy check (Double booking)
        for a in assignment:
            if a['day'] == day and a['slot_idx'] == slot_idx:
                if a['faculty'] == course['faculty']:
                    return False
                if a['room'] == room['roomId']:
                    return False
        
        # 2. Room capacity check
        if room['capacity'] < course.get('min_capacity', 0):
            return False
            
        return True

    def solve(self, course_idx=0, assignment=None):
        if assignment is None:
            assignment = []
            
        # Base case: all courses assigned
        if course_idx == len(self.courses):
            return assignment

        course = self.courses[course_idx]
        
        # Try every possible Day/Slot/Room
        # Shuffle rooms and days to provide variety in results
        shuffled_days = list(self.days)
        random.shuffle(shuffled_days)
        
        for day in shuffled_days:
            for s_idx, slot in enumerate(self.slots):
                for room in self.rooms:
                    # Check if room matches course type (Lab vs Lecture)
                    if course['type'] == 'Lab' and room['type'] != 'Computer Lab':
                        continue
                    if course['type'] == 'Lecture' and room['type'] == 'Computer Lab':
                        continue

                    if self.is_consistent(assignment, course, day, s_idx, room):
                        # For Labs, we need two consecutive slots
                        if course['type'] == 'Lab':
                            if s_idx + 1 >= len(self.slots) or not self.is_consistent(assignment, course, day, s_idx + 1, room):
                                continue
                            
                            # Place Lab (2 slots)
                            assignment.append({'day': day, 'slot_idx': s_idx, 'subject': course['subject'], 'faculty': course['faculty'], 'room': room['roomId'], 'type': 'Lab'})
                            assignment.append({'day': day, 'slot_idx': s_idx+1, 'subject': course['subject'], 'faculty': course['faculty'], 'room': room['roomId'], 'type': 'Lab'})
                        else:
                            # Place Lecture
                            assignment.append({'day': day, 'slot_idx': s_idx, 'subject': course['subject'], 'faculty': course['faculty'], 'room': room['roomId'], 'type': 'Lecture'})
                        
                        result = self.solve(course_idx + 1, assignment)
                        if result:
                            return result
                            
                        # Backtrack
                        if course['type'] == 'Lab':
                            assignment.pop()
                            assignment.pop()
                        else:
                            assignment.pop()
                            
        return None

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    faculties = data.get('faculties', [])
    rooms = data.get('rooms', [])
    courses = data.get('courses', []) # List of subjects to schedule
    
    # Load Vasavi config
    with open('config.json') as f:
        config = json.load(f)
        
    solver = TimetableSolver(faculties, rooms, courses, config)
    solution = solver.solve()
    
    if solution:
        # Add fixed sessions (Mentor, Sports) to the final output
        final_data = solution + solver.fixed_sessions
        return jsonify({"status": "success", "data": final_data})
    else:
        return jsonify({"status": "error", "message": "No valid schedule could be generated with given constraints"}), 400

import json
if __name__ == '__main__':
    app.run(port=5001, debug=True)
