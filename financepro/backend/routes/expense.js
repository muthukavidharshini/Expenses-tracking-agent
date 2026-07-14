const express = require("express")
const router = express.Router()
const Transaction = require("../models/Transaction")
const User = require("../models/User")
const Budget = require("../models/Budget")
const Notification = require("../models/Notification")

// Helper function to get current balance for a user
const getCurrentBalance = async (userId) => {
  const result = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
        }
      }
    }
  ])

  if (result.length === 0) return 0
  return result[0].totalIncome - result[0].totalExpenses
}

// Need mongoose in helper
const mongoose = require("mongoose")

// Get all expense transactions for a specific user
router.get("/expense/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Query parameters
    const month = parseInt(req.query.month) || currentMonth
    const year = parseInt(req.query.year) || currentYear
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const search = req.query.search || ""
    const category = req.query.category || ""
    const sortBy = req.query.sortBy || "date" // date, amount
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

    // Build filter
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const filter = {
      userId: userId,
      type: "expense",
      date: { $gte: startDate, $lte: endDate }
    }

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { notes: { $regex: search, $options: "i" } },
        { merchant: { $regex: search, $options: "i" } }
      ]
    }

    // Sort definition
    const sort = {}
    if (sortBy === "amount") {
      sort.amount = sortOrder
    } else {
      sort.date = sortOrder
      sort.createdAt = sortOrder
    }

    const totalExpenses = await Transaction.countDocuments(filter)
    const expenseResult = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      data: {
        userId: userId,
        userName: user.name,
        expenseTransactions: expenseResult.map(t => ({
          id: t._id,
          category: t.category,
          amount: t.amount,
          date: t.date,
          notes: t.notes,
          merchant: t.merchant,
          paymentMethod: t.paymentMethod,
          tags: t.tags,
          receiptUrl: t.receiptUrl,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        })),
        month: month,
        year: year,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalExpenses / limit),
          totalTransactions: totalExpenses,
          limit: limit
        }
      }
    })
  } catch (error) {
    console.error("Fetch expense error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Add a new expense transaction with balance validation
router.post("/expense", async (req, res) => {
  try {
    const { user_id, category, amount, date, notes, merchant, paymentMethod, tags, receiptUrl } = req.body

    if (!user_id || !category || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, category, amount, date"
      })
    }

    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const expenseAmount = parseFloat(amount)
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ success: false, error: "Amount must be a positive number" })
    }

    // Verify balance (bypassed to allow logging expenses when balance is low)
    const currentBalance = await getCurrentBalance(user_id)
    /*
    if (expenseAmount > currentBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Current balance: ₹${currentBalance.toFixed(2)}, Expense amount: ₹${expenseAmount.toFixed(2)}`
      })
    }
    */

    const newExpense = new Transaction({
      userId: user_id,
      type: "expense",
      category,
      amount: expenseAmount,
      date: new Date(date),
      notes,
      merchant,
      paymentMethod: paymentMethod || "Cash",
      tags: tags || [],
      receiptUrl
    })

    await newExpense.save()

    // Check budget limits for this category, month, and year
    const expenseDate = new Date(date)
    const budgetMonth = expenseDate.getMonth() + 1
    const budgetYear = expenseDate.getFullYear()

    const budget = await Budget.findOne({
      userId: user_id,
      category,
      month: budgetMonth,
      year: budgetYear
    })

    if (budget) {
      // Calculate total spent in this category for the month
      const startOfMonth = new Date(budgetYear, budgetMonth - 1, 1)
      const endOfMonth = new Date(budgetYear, budgetMonth, 0, 23, 59, 59, 999)

      const categorySpentResult = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(user_id),
            type: "expense",
            category,
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$amount" }
          }
        }
      ])

      const totalSpent = categorySpentResult.length > 0 ? categorySpentResult[0].totalSpent : 0

      if (totalSpent > budget.monthlyLimit) {
        // Create budget exceeded notification
        const notification = new Notification({
          userId: user_id,
          type: "budget_exceeded",
          title: "Budget Exceeded",
          message: `Your spending in category "${category}" has reached ₹${totalSpent.toFixed(2)}, exceeding your monthly budget of ₹${budget.monthlyLimit.toFixed(2)}.`
        })
        await notification.save()
      }
    }

    res.status(201).json({
      success: true,
      message: "Expense transaction added successfully",
      data: {
        id: newExpense._id,
        user_id: user_id,
        type: "expense",
        category: newExpense.category,
        amount: newExpense.amount,
        date: newExpense.date,
        notes: newExpense.notes,
        merchant: newExpense.merchant,
        paymentMethod: newExpense.paymentMethod,
        tags: newExpense.tags,
        receiptUrl: newExpense.receiptUrl,
        remainingBalance: currentBalance - expenseAmount
      }
    })
  } catch (error) {
    console.error("Add expense error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Duplicate an expense transaction
router.post("/expense/duplicate/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params
    const originalTx = await Transaction.findById(transactionId)
    if (!originalTx || originalTx.type !== "expense") {
      return res.status(404).json({ success: false, error: "Expense transaction not found" })
    }

    const currentBalance = await getCurrentBalance(originalTx.userId)
    /*
    if (originalTx.amount > currentBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance to duplicate this expense. Current balance: ₹${currentBalance.toFixed(2)}`
      })
    }
    */

    const duplicatedTx = new Transaction({
      userId: originalTx.userId,
      type: "expense",
      category: originalTx.category,
      amount: originalTx.amount,
      date: new Date(), // Set to current date
      notes: originalTx.notes ? `Duplicated: ${originalTx.notes}` : "Duplicated transaction",
      merchant: originalTx.merchant,
      paymentMethod: originalTx.paymentMethod,
      tags: originalTx.tags,
      receiptUrl: originalTx.receiptUrl
    })

    await duplicatedTx.save()

    res.status(201).json({
      success: true,
      message: "Expense transaction duplicated successfully",
      data: duplicatedTx
    })
  } catch (error) {
    console.error("Duplicate expense error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Update an expense transaction
router.put("/expense/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params
    const { category, amount, date, notes, user_id, merchant, paymentMethod, tags, receiptUrl } = req.body

    const expense = await Transaction.findById(transactionId)
    if (!expense || expense.type !== "expense" || expense.userId.toString() !== user_id) {
      return res.status(404).json({
        success: false,
        error: "Expense transaction not found or does not belong to this user"
      })
    }

    const oldAmount = expense.amount
    const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount

    if (amount !== undefined && (isNaN(newAmount) || newAmount <= 0)) {
      return res.status(400).json({ success: false, error: "Amount must be a positive number" })
    }

    // Verify balance changes (bypassed to allow updating expenses when balance is low)
    /*
    if (newAmount !== oldAmount) {
      const currentBalance = await getCurrentBalance(user_id)
      const balanceAfterRevert = currentBalance + oldAmount // Add back old amount to check capacity
      if (newAmount > balanceAfterRevert) {
        return res.status(400).json({
          success: false,
          error: `Insufficient balance. Available balance: ₹${balanceAfterRevert.toFixed(2)}, New expense amount: ₹${newAmount.toFixed(2)}`
        })
      }
    }
    */

    if (category) expense.category = category
    if (amount !== undefined) expense.amount = newAmount
    if (date) expense.date = new Date(date)
    if (notes !== undefined) expense.notes = notes
    if (merchant !== undefined) expense.merchant = merchant
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod
    if (tags !== undefined) expense.tags = tags
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl
    expense.updatedAt = Date.now()

    await expense.save()

    res.json({
      success: true,
      message: "Expense transaction updated successfully",
      data: expense
    })
  } catch (error) {
    console.error("Update expense error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Delete an expense transaction
router.delete("/expense/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params
    const userId = req.query.user_id

    if (!userId) {
      return res.status(400).json({ success: false, error: "Valid user_id is required as query param" })
    }

    const expense = await Transaction.findOneAndDelete({ _id: transactionId, userId, type: "expense" })
    if (!expense) {
      return res.status(404).json({ success: false, error: "Expense transaction not found" })
    }

    res.json({
      success: true,
      message: "Expense transaction deleted successfully"
    })
  } catch (error) {
    console.error("Delete expense error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get expense summary for a specific user with month/year filtering
router.get("/expense-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const month = parseInt(req.query.month) || currentMonth
    const year = parseInt(req.query.year) || currentYear

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Calculate current total balance
    const currentBalance = await getCurrentBalance(userId)

    // Calculate monthly expense total
    const monthlyTotalResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ])
    const monthlyTotal = monthlyTotalResult.length > 0 ? monthlyTotalResult[0].total : 0

    // Calculate yearly expense total
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)
    const yearlyTotalResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ])
    const yearlyTotal = yearlyTotalResult.length > 0 ? yearlyTotalResult[0].total : 0

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $project: { category: "$_id", total: 1, count: 1, _id: 0 } },
      { $sort: { total: -1 } }
    ])

    res.json({
      success: true,
      data: {
        userId,
        userName: user.name,
        monthlyTotal,
        yearlyTotal,
        expensesByCategory: categoryBreakdown,
        currentBalance: Math.max(0, currentBalance),
        month,
        year
      }
    })
  } catch (error) {
    console.error("Fetch expense summary error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

module.exports = router