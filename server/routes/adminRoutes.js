const express = require('express');
const Venue = require('../models/Venue');
const Resource = require('../models/Resource');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// @route   POST /api/venues
router.post('/venues', roleMiddleware(['Admin/ITC']), async (req, res) => {
    try {
        const venue = new Venue(req.body);
        await venue.save();
        res.status(201).json(venue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/venues
// Open to all authenticated users so they can see venues
router.get('/venues', async (req, res) => {
    try {
        const venues = await Venue.find();
        res.json(venues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/resources
router.post('/resources', roleMiddleware(['Admin/ITC']), async (req, res) => {
    try {
        const resource = new Resource(req.body);
        await resource.save();
        res.status(201).json(resource);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/resources
router.get('/resources', async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
