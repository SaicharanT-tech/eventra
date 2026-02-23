const express = require('express');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Resource = require('../models/Resource');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Helper function to check conflicts
async function checkConflicts(venueId, date, startTime, endTime, participants, eventId = null) {
    // Check Venue Capacity
    const venue = await Venue.findById(venueId);
    if (!venue) return { conflict: true, message: 'Venue not found' };
    if (venue.capacity < participants) {
        return { conflict: true, message: `Venue capacity (${venue.capacity}) is less than participants (${participants})` };
    }

    // Check double booking for the same venue and date/time
    const query = {
        venueId,
        date,
        status: { $in: ['Approved', 'HOD Approved', 'Dean Approved', 'Pending', 'Running'] }
    };
    if (eventId) {
        query._id = { $ne: eventId };
    }

    const existingEvents = await Event.find(query);

    for (let ev of existingEvents) {
        if (startTime < ev.endTime && endTime > ev.startTime) {
            return { conflict: true, message: `Time conflict with event: ${ev.title}` };
        }
    }

    return { conflict: false };
}

// POST create event
router.post('/', roleMiddleware(['Event Coordinator']), async (req, res) => {
    try {
        const { title, department, date, startTime, endTime, participants, venueId, resources } = req.body;

        // Convert string date to Date object (assuming YYYY-MM-DD from frontend)
        const eventDate = new Date(date);

        const conflictCheck = await checkConflicts(venueId, eventDate, startTime, endTime, participants);
        if (conflictCheck.conflict) {
            return res.status(400).json({ message: conflictCheck.message });
        }

        const event = new Event({
            title,
            department,
            date: eventDate,
            startTime,
            endTime,
            participants,
            venueId,
            resources,
            coordinator: req.user.id
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET query events based on role
router.get('/', async (req, res) => {
    try {
        const role = req.user.role;
        let query = {};

        if (role === 'Event Coordinator') {
            query.coordinator = req.user.id;
        }
        // We'll remove strict department filtering for HOD for now to ensure they can see all Pending requests
        // as per the requirement for 'all pending approvals correctly displayed'.

        const events = await Event.find(query).populate('coordinator venueId resources.resourceId');
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT approve event
router.put('/:id/approve', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const role = req.user.role;
        let newStatus = event.status;

        if (role === 'HOD' && event.status === 'Pending') {
            newStatus = 'HOD Approved';
        } else if (role === 'Dean' && event.status === 'HOD Approved') {
            newStatus = 'Dean Approved';
        } else if (role === 'Institutional Head' && event.status === 'Dean Approved') {
            newStatus = 'Approved';

            // Secondary check right before final approval
            const conflictCheck = await checkConflicts(event.venueId, event.date, event.startTime, event.endTime, event.participants, event._id);
            if (conflictCheck.conflict) {
                return res.status(400).json({ message: 'Cannot approve: ' + conflictCheck.message });
            }

            // Allocate resources on final approval
            for (let reqRes of event.resources) {
                // Check if available first
                const resource = await Resource.findById(reqRes.resourceId);
                if (resource.quantityAvailable < reqRes.quantity) {
                    return res.status(400).json({ message: `Conflict: Not enough ${resource.name} available.` });
                }
            }

            for (let reqRes of event.resources) {
                await Resource.findByIdAndUpdate(reqRes.resourceId, {
                    $inc: { quantityAvailable: -reqRes.quantity }
                });
            }
        } else {
            return res.status(400).json({ message: 'Invalid approval step or role for current status' });
        }

        event.status = newStatus;
        event.approvalHistory.push({
            role,
            decision: 'Approved',
            reason: req.body.reason || ''
        });

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT reject event
router.put('/:id/reject', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.status = 'Rejected';
        event.approvalHistory.push({
            role: req.user.role,
            decision: 'Rejected',
            reason: req.body.reason || 'No reason provided'
        });

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT start event
router.put('/:id/start', roleMiddleware(['Event Coordinator']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.status !== 'Approved') {
            return res.status(400).json({ message: 'Only fully approved events can be started' });
        }

        event.status = 'Running';
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT complete event
router.put('/:id/complete', roleMiddleware(['Event Coordinator']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.status !== 'Running') {
            return res.status(400).json({ message: 'Only running events can be completed' });
        }

        event.status = 'Completed';

        // Release resources
        for (let reqRes of event.resources) {
            await Resource.findByIdAndUpdate(reqRes.resourceId, {
                $inc: { quantityAvailable: reqRes.quantity }
            });
        }

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
