const mongoose = require('mongoose');

const ReceiptItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true }
});

const ReceiptScanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String, required: true },
    merchant: { type: String },
    date: { type: Date },
    amount: { type: Number },
    tax: { type: Number, default: 0 },
    items: [ReceiptItemSchema],
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReceiptScan', ReceiptScanSchema);
