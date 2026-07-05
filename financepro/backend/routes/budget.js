const express = require("express")
const router = express.Router()
const Budget = require("../models/Budget")
const User = require("../models/User")
const Transaction = require("../models/Transaction")
const mongoose = require("mongoose")

// Get all budgets for a specific user
router.get("/budget/:userId", async (req, res) => {
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

    const budgets = await Budget.find({ userId, month, year }).sort({ category: 1 })

    res.json({
      success: true,
      data: {
        userId,
        userName: user.name,
        budgets: budgets.map(b => ({
          id: b._id,
          category: b.category,
          monthly_limit: b.monthlyLimit,
          month: b.month,
          year: b.year,
          createdAt: b.createdAt
        })),
        month,
        year
      }
    })
  } catch (error) {
    console.error("Fetch budget error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Add a new budget
router.post("/budget", async (req, res) => {
  try {
    const { user_id, category, monthly_limit, month, year } = req.body

    if (!user_id || !category || !monthly_limit) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, category, monthly_limit"
      })
    }

    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const limitAmount = parseFloat(monthly_limit)
    if (isNaN(limitAmount) || limitAmount <= 0) {
      return res.status(400).json({ success: false, error: "Monthly limit must be a positive number" })
    }

    const budgetMonth = parseInt(month) || new Date().getMonth() + 1
    const budgetYear = parseInt(year) || new Date().getFullYear()

    // Check if budget exists for this category, month, and year
    const existingBudget = await Budget.findOne({
      userId: user_id,
      category,
      month: budgetMonth,
      year: budgetYear
    })

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: `Budget for category '${category}' already exists for ${budgetMonth}/${budgetYear}`
      })
    }

    const newBudget = new Budget({
      userId: user_id,
      category,
      monthlyLimit: limitAmount,
      month: budgetMonth,
      year: budgetYear
    })

    await newBudget.save()

    res.status(201).json({
      success: true,
      message: "Budget added successfully",
      data: newBudget
    })
  } catch (error) {
    console.error("Add budget error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Update a budget
router.put("/budget/:budgetId", async (req, res) => {
  try {
    const { budgetId } = req.params
    const { monthly_limit, user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ success: false, error: "user_id is required" })
    }

    const limitAmount = parseFloat(monthly_limit)
    if (isNaN(limitAmount) || limitAmount <= 0) {
      return res.status(400).json({ success: false, error: "Monthly limit must be a positive number" })
    }

    const budget = await Budget.findOne({ _id: budgetId, userId: user_id })
    if (!budget) {
      return res.status(404).json({ success: false, error: "Budget not found or does not belong to this user" })
    }

    budget.monthlyLimit = limitAmount
    await budget.save()

    res.json({
      success: true,
      message: "Budget updated successfully",
      data: budget
    })
  } catch (error) {
    console.error("Update budget error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Delete a budget
router.delete("/budget/:budgetId", async (req, res) => {
  try {
    const { budgetId } = req.params
    const userId = req.query.user_id

    if (!userId) {
      return res.status(400).json({ success: false, error: "Valid user_id is required as query param" })
    }

    const budget = await Budget.findOneAndDelete({ _id: budgetId, userId })
    if (!budget) {
      return res.status(404).json({ success: false, error: "Budget not found or does not belong to this user" })
    }

    res.json({
      success: true,
      message: "Budget deleted successfully"
    })
  } catch (error) {
    console.error("Delete budget error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get budget vs expense analysis for a specific user
router.get("/budget-analysis/:userId", async (req, res) => {
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

    // Get all budgets for specified period
    const budgets = await Budget.find({ userId, month, year })

    // Aggregate actual expenses for specified period
    const expenses = await Transaction.aggregate([
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
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ])

    // Build analysis map
    const budgetMap = {}
    budgets.forEach(b => {
      budgetMap[b.category] = {
        budgeted: b.monthlyLimit,
        spent: 0,
        remaining: b.monthlyLimit,
        percentage: 0,
        status: "under",
        transaction_count: 0
      }
    })

    expenses.forEach(e => {
      const category = e._id
      const spent = e.totalSpent

      if (budgetMap[category]) {
        budgetMap[category].spent = spent
        budgetMap[category].remaining = budgetMap[category].budgeted - spent
        budgetMap[category].percentage = (spent / budgetMap[category].budgeted) * 100
        budgetMap[category].transaction_count = e.count

        if (spent > budgetMap[category].budgeted) {
          budgetMap[category].status = "over"
        } else if (spent >= budgetMap[category].budgeted * 0.8) {
          budgetMap[category].status = "warning"
        } else {
          budgetMap[category].status = "under"
        }
      } else {
        budgetMap[category] = {
          budgeted: 0,
          spent: spent,
          remaining: -spent,
          percentage: 0,
          status: "no_budget",
          transaction_count: e.count
        }
      }
    })

    // Compute totals
    let totalBudgeted = 0
    let totalSpent = 0
    let categoriesOverBudget = 0
    let categoriesUnderBudget = 0

    Object.values(budgetMap).forEach(item => {
      totalBudgeted += item.budgeted
      totalSpent += item.spent
      if (item.status === "over") categoriesOverBudget++
      if (item.status === "under" && item.budgeted > 0) categoriesUnderBudget++
    })

    res.json({
      success: true,
      data: {
        userId,
        userName: user.name,
        month,
        year,
        summary: {
          totalBudgeted,
          totalSpent,
          totalRemaining: totalBudgeted - totalSpent,
          overallPercentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
          categoriesOverBudget,
          categoriesUnderBudget,
          totalCategories: Object.keys(budgetMap).length
        },
        categoryAnalysis: budgetMap
      }
    })
  } catch (error) {
    console.error("Budget analysis error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get budget summary for dashboard
router.get("/budget-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const budgets = await Budget.find({ userId, month: currentMonth, year: currentYear })

    const totalBudgets = budgets.length
    const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)

    res.json({
      success: true,
      data: {
        userId,
        month: currentMonth,
        year: currentYear,
        totalBudgets,
        totalBudgetAmount
      }
    })
  } catch (error) {
    console.error("Budget summary error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

module.exports = router
