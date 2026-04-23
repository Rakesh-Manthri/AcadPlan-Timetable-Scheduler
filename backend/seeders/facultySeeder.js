const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('../models/Faculty');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const facultyData = [
    {
        employeeId: '1280',
        name: 'Dr. K. Ram Mohan Rao',
        designation: 'Professor & HOD',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Deep Learning', 'Grid Computing'],
        email: 'krmrao@staff.vce.ac.in',
        maxWeeklyLoad: 10
    },
    {
        employeeId: '2200',
        name: 'Dr. Tilottama Goswami',
        designation: 'Professor',
        qualifications: 'M.S., Ph.D.',
        department: 'IT',
        specialization: ['Information Technology'],
        email: 'goswami.tilottama@gmail.com',
        maxWeeklyLoad: 12
    },
    {
        employeeId: '1395',
        name: 'Dr. S. Aruna',
        designation: 'Associate Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Data Science', 'Optimization'],
        email: 's.aruna@staff.vce.ac.in',
        maxWeeklyLoad: 14
    },
    {
        employeeId: '2104',
        name: 'Dr. Burgula Kezia Rani',
        designation: 'Associate Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Image Processing', 'AI'],
        email: 'keziarani@staff.vce.ac.in',
        maxWeeklyLoad: 14
    },
    {
        employeeId: '2122',
        name: 'Dr. T. Hitendra Sarma',
        designation: 'Associate Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Deep Learning', 'Computer Vision'],
        email: 't.hitendrasarma@gmail.com',
        maxWeeklyLoad: 14
    },
    {
        employeeId: '2191',
        name: 'Dr. M. Neelakantappa',
        designation: 'Associate Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Computer Networks'],
        email: 'm.neelakanta@gmail.com',
        maxWeeklyLoad: 14
    },
    {
        employeeId: '2192',
        name: 'Dr. S.K. Prashanth',
        designation: 'Associate Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Cloud Computing', 'IoT'],
        email: 'sksspa21@gmail.com',
        maxWeeklyLoad: 14
    },
    {
        employeeId: '2081',
        name: 'Mr. Dharma Reddy. R',
        designation: 'Associate Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Software Dev', 'Lead Engineering'],
        email: 'rakeshdharma@gmail.com',
        maxWeeklyLoad: 14
    },
    {
        employeeId: '1307',
        name: 'Dr. S. Sree Lakshmi',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Information Technology'],
        email: 's.sreelakshmi@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1304',
        name: 'Dr. K. Rama Krishna',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Software Systems'],
        email: 'k.ramakrishna@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1536',
        name: 'Ms. S. Rajya Laxmi',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Information Technology'],
        email: 's.rajyalaxmi@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1709',
        name: 'Mr. N. David Raju',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Hardware', 'Networking', 'PC HW'],
        email: 'n.davidraju@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1877',
        name: 'Mr. G. Rajashekhar',
        designation: 'Assistant Professor',
        qualifications: 'M.E.',
        department: 'IT',
        specialization: ['Systems Engineering'],
        email: 'rajashekhar_gattu@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1935',
        name: 'Ms. D.R.L. Prasanna',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Cryptography', 'Steganography'],
        email: 'prasannadusi@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1938',
        name: 'Ms. L. Divya',
        designation: 'Assistant Professor',
        qualifications: 'M.S.',
        department: 'IT',
        specialization: ['Computer Networks'],
        email: 'divya.lingineni@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '1529',
        name: 'Dr. K. S. Chakravarthy',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Intelligent Systems'],
        email: 'chakri4330@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2003',
        name: 'Dr. C. Sireesha',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Data Engineering'],
        email: 'sireesha@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2025',
        name: 'Dr. B. Leelavathy',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Machine Learning'],
        email: 'leelapallava@staff.vce.ac.in',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2144',
        name: 'Ms. Haseeba Yaseen',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['AI/ML', 'Signal Processing'],
        email: 'haseebayaseen@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2119',
        name: 'Ms. G. Radha',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Computer Science'],
        email: 'radhagadige1189@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2163',
        name: 'Mrs. M. Sathya Devi',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Information Technology'],
        email: 'satyamaraganti@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2243',
        name: 'Ms. Sruthi Anand',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Machine Learning'],
        email: 'sruthi.sruth31@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2248',
        name: 'Ms. Soume Sanyal',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Data Analytics'],
        email: 'soume.sanyal@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2257',
        name: 'Dr. T. Anjani Devi',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['VLSI System Design'],
        email: 'anjali.nagineni@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2267',
        name: 'Mr. Md. Gazwan Ahmed Khan',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Computer Science'],
        email: 'mohammedghazwanahmedkhan@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2277',
        name: 'Ms. R. Nanda Kumari',
        designation: 'Assistant Professor',
        qualifications: 'M.E.',
        department: 'IT',
        specialization: ['Electronics & IT'],
        email: 'r.nandhakumari@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2306',
        name: 'Dr. Arun Silivery',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech., Ph.D.',
        department: 'IT',
        specialization: ['Information Systems'],
        email: 'siliveryarun@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2317',
        name: 'Mr. Chanuwala Harishwar',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Distributed Systems'],
        email: 'sharishwarreddy.976@gmail.com',
        maxWeeklyLoad: 16
    },
    {
        employeeId: '2323',
        name: 'Ms. K. Kavya',
        designation: 'Assistant Professor',
        qualifications: 'M.Tech.',
        department: 'IT',
        specialization: ['Information Technology'],
        email: 'kommukavya1995@gmail.com',
        maxWeeklyLoad: 16
    }
];

const seedFaculty = async () => {
    try {
        // Clear existing faculty
        await Faculty.deleteMany({});
        console.log('🗑️  Cleared existing faculty data');

        // Insert all faculty
        const created = await Faculty.insertMany(facultyData);
        console.log(`✅ Successfully seeded ${created.length} faculty members:`);
        created.forEach((f, i) => {
            console.log(`   ${i + 1}. [${f.employeeId}] ${f.name} — ${f.designation}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedFaculty();
