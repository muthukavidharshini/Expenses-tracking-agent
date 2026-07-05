const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // null means global/system category
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String }, // e.g. 'Coffee', 'Home', 'ShoppingBag'
    color: { type: String }, // e.g. '#EF4444' or 'hsl(120, 100%, 50%)'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', CategorySchema);
