const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    availabilitySchedule: [{
        date: { type: Date },
        times: [{ startTime: String, endTime: String }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
