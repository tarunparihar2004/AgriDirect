const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    crop: String,
    temperature: Number,
    humidity: Number,
    soilImagePath: String,
    location: {
        lat: Number,
        lon: Number
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Record', RecordSchema);