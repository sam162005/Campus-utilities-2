// server/models/LostFoundItem.js
const mongoose = require('mongoose');

const LostFoundItemSchema = new mongoose.Schema({
    type: { type: String, enum: ['lost', 'found'], required: true },
    item: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String }, // This can store the original image URL or Base64 if you decide to store it
    geminiAnalysis: { // NEW FIELD: To store the AI-generated description/analysis
        type: String,
        trim: true
    },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.LostFoundItem || mongoose.model('LostFoundItem', LostFoundItemSchema);
