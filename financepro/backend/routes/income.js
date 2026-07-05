const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all income transactions for a specific user
router.get('/income/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const month = parseInt(req.query.month) || currentMonth;
        const year = parseInt(req.query.year) || currentYear;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const category = req.query.category || "";

        // Date range for the specific month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const filter = {
            userId,
            type: 'income',
            date: { $gte: startDate, $lte: endDate }
        };

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.notes = { $regex: search, $options: "i" };
        }

        const totalIncome = await Transaction.countDocuments(filter);
        const incomeResult = await Transaction.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: {
                userId,
                userName: user.name,
                incomeTransactions: incomeResult.map(t => ({
                    id: t._id,
                    category: t.category,
                    amount: t.amount,
                    date: t.date,
                    notes: t.notes,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt
                })),
                month,
                year,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalIncome / limit),
                    totalTransactions: totalIncome,
                    limit
                }
            }
        });
    } catch (error) {
        console.error('Fetch income error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Add a new income transaction
router.post('/income', async (req, res) => {
    try {
        const { user_id, category, amount, date, notes } = req.body;

        if (!user_id || !category || !amount || !date) {
            return res.status(400).json({ success: false, error: 'Missing required fields: user_id, category, amount, date' });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const incomeAmount = parseFloat(amount);
        if (isNaN(incomeAmount) || incomeAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
        }

        const newIncome = new Transaction({
            userId: user_id,
            type: 'income',
            category,
            amount: incomeAmount,
            date: new Date(date),
            notes
        });

        await newIncome.save();

        res.status(201).json({
            success: true,
            message: 'Income added successfully',
            data: {
                id: newIncome._id,
                category: newIncome.category,
                amount: newIncome.amount,
                date: newIncome.date,
                notes: newIncome.notes
            }
        });
    } catch (error) {
        console.error('Add income error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Edit income
router.put('/income/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, date, notes, user_id } = req.body;

        const income = await Transaction.findOne({ _id: id, type: 'income' });
        if (!income) {
            return res.status(404).json({ success: false, error: 'Income transaction not found' });
        }

        if (category) income.category = category;
        if (amount !== undefined) {
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
            }
            income.amount = parsedAmount;
        }
        if (date) income.date = new Date(date);
        if (notes !== undefined) income.notes = notes;
        income.updatedAt = Date.now();

        await income.save();

        res.json({
            success: true,
            message: 'Income updated successfully',
            data: {
                id: income._id,
                category: income.category,
                amount: income.amount,
                date: income.date,
                notes: income.notes
            }
        });
    } catch (error) {
        console.error('Update income error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Delete income
router.delete('/income/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.user_id;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'Valid user_id is required as query param' });
        }

        const income = await Transaction.findOneAndDelete({ _id: id, userId, type: 'income' });
        if (!income) {
            return res.status(404).json({ success: false, error: 'Income transaction not found' });
        }

        res.json({
            success: true,
            message: 'Income deleted successfully'
        });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;