import React from 'react';
import TimetableGrid from '@/components/dashboard/TimetableGrid';

const dummyData = [
  { day: 'Mon', startTimeIdx: 0, subject: 'Operating Systems', faculty: 'Dr. Ramesh K', room: 'IT-201', type: 'Lecture' },
  { day: 'Mon', startTimeIdx: 1, subject: 'Compiler Design', faculty: 'Prof. Anitha', room: 'IT-201', type: 'Lecture' },
  { day: 'Mon', startTimeIdx: 5, subject: 'Database Systems', faculty: 'Dr. Suresh V', room: 'IT-202', type: 'Lecture', isConflict: true },
  
  { day: 'Tue', startTimeIdx: 0, subject: 'Network Security Lab', faculty: 'Prof. Kiran', room: 'Lab-1', type: 'Lab', span: 3 },
  
  { day: 'Wed', startTimeIdx: 2, subject: 'Web Technologies', faculty: 'Ms. Shruthi', room: 'IT-201', type: 'Lecture' },
  { day: 'Wed', startTimeIdx: 5, subject: 'Software Engineering', faculty: 'Dr. Mallesh', room: 'IT-202', type: 'Lecture' },

  { day: 'Thu', startTimeIdx: 0, subject: 'Full Stack Lab', faculty: 'Prof. Naveen', room: 'Lab-3', type: 'Lab', span: 3 },
  
  { day: 'Fri', startTimeIdx: 0, subject: 'AI & ML', faculty: 'Dr. Lakshmi', room: 'IT-201', type: 'Lecture' },
  { day: 'Fri', startTimeIdx: 1, subject: 'Mobile App Dev', faculty: 'Mr. Varun', room: 'IT-202', type: 'Lecture' },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <TimetableGrid courses={dummyData} />
    </div>
  );
};

export default DashboardPage;
