const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true, index: true },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String },
    merchant: { type: String },
    paymentMethod: { type: String, default: 'Cash' },
    tags: [{ type: String }],
    receiptUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
