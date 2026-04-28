# AcadPlan - Timetable Scheduler

AcadPlan is a modern, full-stack academic timetable scheduling system designed to automate the complex process of generating class schedules for educational institutions. It features a modern React-based dashboard, a Node.js backend for resource management, and a specialized Python-based CSP (Constraint Satisfaction Problem) solver.

## 🚀 Features

- **Timetable Generator**: Multi-year, multi-section branch solver with a 3-wave approach.
- **Role-Based Access Control**: Different views and permissions for Admins, HODs, Faculty, and Students.
- **Faculty Management**: Track faculty loads, specializations, and weekly availability.
- **Room Allocation**: Categorize and manage lecture halls and specialized labs.
- **Schedule Gallery**: Compare multiple generation runs and pick the best versions for each section.
- **Student Dashboard**: Clean, read-only view for students to access their official timetables.
- **Print Optimization**: One-page landscape printing for official reports.
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui with full dark mode support.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, shadcn/ui.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Solver**: Python (Flask), CSP Algorithm.

## 📦 Project Structure

```
AcadPlan-Timetable-Scheduler/
├── backend/            # Express.js API server
├── frontend/           # React/Vite dashboard
└── scheduler/          # Python CSP solver engine
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Running locally or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with PORT=5000 and MONGO_URI
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Scheduler Setup
```bash
cd scheduler
# Recommended: Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 🎯 Usage

1. **Login**: Use administrative credentials to access the management dashboard.
2. **Setup Resources**: Add Faculty members and Rooms in their respective tabs.
3. **Configure Constraints**: In the Timetable Generator, map subjects to faculty and define fixed slots or rotation rules.
4. **Generate**: Click "Generate Branch Schedule" and review the results in the Preview tab.
5. **Publish**: Once satisfied, the schedules are available for student viewing.

## 👤 Developed By

- **Rakesh Manthri**

## 📄 License

This project is licensed under the ISC License.
