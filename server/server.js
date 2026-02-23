require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-management';

async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log('Local MongoDB not found. Launching in-memory MongoDB for demo...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        console.log('In-memory MongoDB connected successfully');

        console.log('Seeding in-memory database with demo data...');
        const seedDatabase = require('./seed');
        await seedDatabase();
    }
}
connectToDatabase();

// Routes
app.use('/api', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', adminRoutes);

app.get('/', (req, res) => {
    res.send('Event Management API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
