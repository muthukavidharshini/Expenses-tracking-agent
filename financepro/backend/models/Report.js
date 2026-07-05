const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['monthly', 'yearly'], required: true },
    month: { type: Number },
    year: { type: Number, required: true },
    summary: { type: String }, // AI summary
    fileUrl: { type: String }, // path or URL to download Excel/PDF/CSV
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
