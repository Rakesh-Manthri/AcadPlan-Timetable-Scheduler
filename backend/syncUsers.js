const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('./models/Faculty');
const User = require('./models/User');

dotenv.config();

const syncUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Connected to DB');

        const faculties = await Faculty.find();

        for (const faculty of faculties) {
            if (!faculty.email) {
                console.log(`Skipping faculty ${faculty.name} - no email`);
                continue;
            }

            let user = await User.findOne({ email: faculty.email });

            const role = faculty.email === 'krmrao@staff.vce.ac.in' ? 'hod' : 'faculty';

            if (!user) {
                user = await User.create({
                    name: faculty.name,
                    email: faculty.email,
                    password: '12345678',
                    role: role,
                    facultyId: faculty._id
                });
                console.log(`Created User for ${faculty.name}`);
            } else {
                user.facultyId = faculty._id;
                user.role = role;
                await user.save();
                console.log(`Updated User for ${faculty.name}`);
            }

            faculty.user = user._id;
            await faculty.save();
        }

        // Ensure an admin user exists
        let admin = await User.findOne({ email: 'admin@vce.ac.in' });
        if (!admin) {
            await User.create({
                name: 'Admin',
                email: 'admin@vce.ac.in',
                password: 'password',
                role: 'admin'
            });
            console.log('Created Admin User');
        }

        console.log('User Sync Complete!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

syncUsers();
