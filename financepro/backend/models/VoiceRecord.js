const mongoose = require('mongoose');

const VoiceRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    audioUrl: { type: String },
    transcript: { type: String, required: true },
    extractedAmount: { type: Number },
    extractedCategory: { type: String },
    extractedMerchant: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VoiceRecord', VoiceRecordSchema);
