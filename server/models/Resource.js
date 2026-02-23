const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['equipment', 'facility', 'ITC', 'food'],
        required: true
    },
    quantityAvailable: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
