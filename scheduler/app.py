from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# CSP Engine Placeholder
# In a real scenario, we would import the algorithm from a separate module
def solve_timetable(data):
    """
    Greedy Heuristic with Backtracking
    Hard Constraints: Room capacity, Faculty availability, No overlaps
    """
    # 1. Extract constraints from data
    faculties = data.get('faculties', [])
    rooms = data.get('rooms', [])
    courses = data.get('courses', [])
    
    # 2. Initialize Timetable Grid (e.g., 6 days x 8 slots)
    # 3. Apply Heuristic (e.g., sort courses by complexity/span)
    # 4. Attempt to place each course (Backtracking if stuck)
    
    # Mock result for now
    return {
        "status": "success",
        "timetable": [
            {"day": "Mon", "slot": 0, "course": "OS", "room": "IT-201", "faculty": "Ramesh"},
            {"day": "Mon", "slot": 1, "course": "CD", "room": "IT-201", "faculty": "Anitha"},
        ]
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "scheduler is online"})

@app.route('/api/generate', methods=['POST'])
def generate_timetable():
    try:
        data = request.json
        result = solve_timetable(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)
