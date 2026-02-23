require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Venue = require('./models/Venue');
const Resource = require('./models/Resource');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-management';

const defaultPassword = 'password123';

const users = [
    { name: 'Alice Coordinator', email: 'coordinator@inst.edu', role: 'Event Coordinator', department: 'Computer Science' },
    { name: 'Bob HOD', email: 'hod@inst.edu', role: 'HOD', department: 'Computer Science' },
    { name: 'Carol Dean', email: 'dean@inst.edu', role: 'Dean' },
    { name: 'Dave Head', email: 'head@inst.edu', role: 'Institutional Head' },
    { name: 'Eve Admin', email: 'admin@inst.edu', role: 'Admin/ITC' },
];

const venues = [
    { name: 'Main Auditorium', capacity: 500 },
    { name: 'CS Seminar Hall', capacity: 100 },
    { name: 'Conference Room A', capacity: 20 }
];

const resources = [
    { name: 'Projector', type: 'equipment', quantityAvailable: 10 },
    { name: 'PA System', type: 'equipment', quantityAvailable: 5 },
    { name: 'Catering Service (Standard)', type: 'food', quantityAvailable: 2 },
    { name: 'Live Streaming Setup', type: 'ITC', quantityAvailable: 3 }
];

async function seedDatabase() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI);
            console.log('Connected to MongoDB.');
        } else {
            console.log('Using existing MongoDB connection for seeding.');
        }

        // Clear existing data for a fresh seed
        await User.deleteMany({});
        await Venue.deleteMany({});
        await Resource.deleteMany({});
        console.log('Cleared existing data.');

        const hashedPwd = await bcrypt.hash(defaultPassword, 10);

        for (const u of users) {
            const user = new User({ ...u, password: hashedPwd });
            await user.save();
        }
        console.log('Users seeded successfully. \nDefault password for all users is: password123');

        for (const v of venues) {
            const venue = new Venue(v);
            await venue.save();
        }
        console.log('Venues seeded successfully.');

        for (const r of resources) {
            const resource = new Resource(r);
            await resource.save();
        }
        console.log('Resources seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error; // Throw error instead of exiting if called from module
    }
}

if (require.main === module) {
    seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    module.exports = seedDatabase;
}
