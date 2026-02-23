const mongoose = require('mongoose');

const approvalHistorySchema = new mongoose.Schema({
    role: { type: String, required: true },
    decision: { type: String, enum: ['Approved', 'Rejected'], required: true },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format HH:mm
    endTime: { type: String, required: true },   // Format HH:mm
    participants: { type: Number, required: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    resources: [{
        resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
        quantity: { type: Number, required: true }
    }],
    status: {
        type: String,
        enum: ['Pending', 'HOD Approved', 'Dean Approved', 'Approved', 'Rejected', 'Running', 'Completed'],
        default: 'Pending'
    },
    approvalHistory: [approvalHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
