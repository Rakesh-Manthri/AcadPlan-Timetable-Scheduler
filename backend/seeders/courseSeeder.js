const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

// Helper: detect type from course name/code
function detectType(name, code) {
    const lower = name.toLowerCase();
    if (lower.includes('lab')) return 'Lab';
    if (lower.includes('project') || lower.includes('internship')) return 'Project';
    if (lower.includes('seminar')) return 'Seminar';
    return 'Lecture';
}

const curriculum = {
    1: [
        { code: 'U25HS010EH', name: 'English Language and Communication', hours: 2 },
        { code: 'U25BS120MA', name: 'Calculus and Linear Algebra', hours: 3 },
        { code: 'U25BS110PH', name: 'Physics Of Semiconductors', hours: 2 },
        { code: 'U25ES110IT', name: 'Python Programming', hours: 3 },
        { code: 'U25ES010EE', name: 'Basic Electrical Engineering', hours: 2 },
        { code: 'U25ES030CE', name: 'Basic Engineering Drawing', hours: 3 },
        { code: 'U25HS040EH', name: 'Learning to Learn', hours: 1 },
        { code: 'U25PE110IT', name: 'Skill Development Course-I', hours: 2 },
        { code: 'U25HS011EH', name: 'English Language Skills Lab', hours: 1 },
        { code: 'U25BS111PH', name: 'Semiconductor Lab', hours: 1 },
        { code: 'U25ES111IT', name: 'Python Programming Lab', hours: 1 },
        { code: 'U25ES011EE', name: 'Basic Electrical Engineering Lab', hours: 1 }
    ],
    2: [
        { code: 'U25BS220MA', name: 'Advanced Calculus', hours: 3 },
        { code: 'U25BS210CH', name: 'Material Chemistry', hours: 2 },
        { code: 'U25ES010CE', name: 'Basic Engineering Mechanics', hours: 2 },
        { code: 'U25ES210IT', name: 'Basic Electronics', hours: 2 },
        { code: 'U25ES220IT', name: 'Digital Electronics & Logic Design', hours: 3 },
        { code: 'U25ES230IT', name: 'Structured Programming', hours: 3 },
        { code: 'U25HS020EH', name: 'Human Values & Ethics - I', hours: 2 },
        { code: 'U25PE210IT', name: 'Skill Development Course - II', hours: 3 },
        { code: 'U25BS011CH', name: 'Chemistry Lab', hours: 1 },
        { code: 'U25ES211IT', name: 'Basic Electronics Lab', hours: 1 },
        { code: 'U25ES231IT', name: 'Structured Programming Lab', hours: 1 }
    ],
    3: [
        { code: 'U24BS310MA', name: 'Discrete Mathematics', hours: 4 },
        { code: 'U24PC310IT', name: 'Digital Electronics & Logic Design', hours: 3 },
        { code: 'U24PC320IT', name: 'Data Structures', hours: 3 },
        { code: 'U24PC330IT', name: 'Object Oriented Programming', hours: 3 },
        { code: 'U24OE3XXXX', name: 'Open Elective - I', hours: 2 },
        { code: 'U24HS310EH', name: 'Critical Thinking', hours: 1 },
        { code: 'U24HS320EH', name: 'Skill Development - I (Comm)', hours: 2 },
        { code: 'U24PE310IT', name: 'Skill Development - II (Tech)', hours: 3 },
        { code: 'U24PC311IT', name: 'Data Structures Lab', hours: 1 },
        { code: 'U24PC321IT', name: 'OOP Lab', hours: 1 },
        { code: 'U24PC331IT', name: 'Network Engineering Lab', hours: 1 }
    ],
    4: [
        { code: 'U24BS420MA', name: 'Probability and Statistics', hours: 3 },
        { code: 'U24PC410IT', name: 'Computer Organization', hours: 3 },
        { code: 'U24PC420IT', name: 'Database Management Systems', hours: 3 },
        { code: 'U24PC430IT', name: 'Design & Analysis of Algorithms', hours: 3 },
        { code: 'U24PC440IT', name: 'Full Stack Development', hours: 3 },
        { code: 'U24OE4XXXX', name: 'Open Elective - II', hours: 3 },
        { code: 'U24HS030EH', name: 'Human Values & Ethics - II', hours: 1 },
        { code: 'U24BS430MA', name: 'Skill Development - III (Aptitude)', hours: 2 },
        { code: 'U24PE410IT', name: 'Skill Development - IV (Tech)', hours: 3 },
        { code: 'U24PC421IT', name: 'DBMS Lab', hours: 1 },
        { code: 'U24PC431IT', name: 'DAA Lab', hours: 1 },
        { code: 'U24PC441IT', name: 'Full Stack Development Lab', hours: 1 }
    ],
    5: [
        { code: 'U23PC510IT', name: 'Computer Networks', hours: 4 },
        { code: 'U23PC520IT', name: 'AI and Machine Learning', hours: 3 },
        { code: 'U23PC530IT', name: 'Microprocessors & Interfacing', hours: 2 },
        { code: 'U23PC540IT', name: 'Operating Systems', hours: 3 },
        { code: 'U23OE5XXXX', name: 'Open Elective - III', hours: 3 },
        { code: 'U25HS570EH', name: 'Design Thinking', hours: 1 },
        { code: 'U23HS510EH', name: 'Skill Development - V (Comm)', hours: 2 },
        { code: 'U23PE510IT', name: 'Skill Development - VI (Tech)', hours: 3 },
        { code: 'U23PC511IT', name: 'Computer Networks Lab', hours: 2 },
        { code: 'U23PC521IT', name: 'AI/ML Lab', hours: 1 },
        { code: 'U23PC531IT', name: 'Microprocessors Lab', hours: 1 },
        { code: 'U23PC541IT', name: 'Operating Systems Lab', hours: 1 }
    ],
    6: [
        { code: 'U23PC610IT', name: 'Software Engineering', hours: 3 },
        { code: 'U23PC620IT', name: 'Distributed Systems & Cloud Computing', hours: 4 },
        { code: 'U23PC630IT', name: 'Neural Networks and Deep Learning', hours: 3 },
        { code: 'U23OE6XXXX', name: 'Open Elective - IV', hours: 3 },
        { code: 'U23HS040EH', name: 'Economics and Finance', hours: 2 },
        { code: 'U23HS630EH', name: 'Skill Development - VII (Verbal)', hours: 2 },
        { code: 'U23PE610IT', name: 'Skill Development - VIII (Tech)', hours: 3 },
        { code: 'U23PC611IT', name: 'Software Engineering Lab', hours: 1 },
        { code: 'U23PC621IT', name: 'Distributed Systems Lab', hours: 1 },
        { code: 'U23PC631IT', name: 'Neural Networks Lab', hours: 1 },
        { code: 'U23PW619IT', name: 'Theme Based Project', hours: 1 }
    ],
    7: [
        { code: 'U22PC710IT', name: 'Automata Theory and Compiler Design', hours: 4 },
        { code: 'U22PC720IT', name: 'Distributed Systems & Cloud Computing', hours: 4 },
        { code: 'U22PC730IT', name: 'Cyber Security', hours: 3 },
        { code: 'U22PE710IT', name: 'Professional Elective - I', hours: 3 },
        { code: 'U22PE720IT', name: 'Professional Elective - II', hours: 3 },
        { code: 'U22PC711IT', name: 'Compiler Design Lab', hours: 1 },
        { code: 'U22PC721IT', name: 'Cloud Computing Lab', hours: 1 },
        { code: 'U22PE711IT', name: 'Prof Elective - I Lab', hours: 1 },
        { code: 'U22PE721IT', name: 'Prof Elective - II Lab', hours: 1 },
        { code: 'U22PW719IT', name: 'Project Seminar', hours: 1 }
    ],
    8: [
        { code: 'U22PE810IT', name: 'Professional Elective - III', hours: 3 },
        { code: 'U22PE820IT', name: 'Professional Elective - IV', hours: 3 },
        { code: 'U22PW819IT', name: 'Project / Internship', hours: 12 }
    ]
};

const seedCourses = async () => {
    try {
        await Course.deleteMany({});
        console.log('🗑️  Cleared existing course data');

        let total = 0;
        for (const [sem, courses] of Object.entries(curriculum)) {
            const docs = courses.map(c => ({
                code: c.code,
                name: c.name,
                semester: parseInt(sem),
                weeklyHours: c.hours,
                type: detectType(c.name, c.code),
                department: 'IT'
            }));

            const created = await Course.insertMany(docs);
            total += created.length;
            console.log(`   Sem ${sem}: ${created.length} courses`);
        }

        console.log(`\n✅ Successfully seeded ${total} courses across 8 semesters`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedCourses();
