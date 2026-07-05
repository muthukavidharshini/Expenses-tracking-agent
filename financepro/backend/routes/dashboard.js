const express = require("express")
const router = express.Router()
const Transaction = require("../models/Transaction")
const User = require("../models/User")
const Budget = require("../models/Budget")
const Goal = require("../models/Goal")
const mongoose = require("mongoose")

// Helper function to calculate financial health score (0 - 100)
const calculateFinancialHealth = (income, expenses, budgetsExceededCount) => {
  if (income === 0) return 50 // baseline

  const savings = income - expenses
  const savingsRate = (savings / income) * 100
  
  let score = 50 // baseline score
  
  // 1. Savings Rate contribution (up to 30 points)
  if (savingsRate > 30) score += 30
  else if (savingsRate > 0) score += (savingsRate / 30) * 30
  else score -= Math.min(20, Math.abs(savingsRate)) // penalize negative savings rate

  // 2. Budget adherence contribution (up to 20 points)
  const budgetPenalties = budgetsExceededCount * 5
  score += Math.max(-20, 20 - budgetPenalties)

  // Ensure score is within [0, 100]
  return Math.min(100, Math.max(0, Math.round(score)))
}

// Get dashboard data for a specific user with month/year or date range filtering
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    let startDate, endDate
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const month = parseInt(req.query.month) || currentMonth
    const year = parseInt(req.query.year) || currentYear

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate)
      endDate = new Date(req.query.endDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59, 999)
    }

    // 1. Calculate Income and Expenses for the period
    const totalResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      }
    ])

    const totalIncome = totalResult.length > 0 ? totalResult[0].income : 0
    const totalExpenses = totalResult.length > 0 ? totalResult[0].expenses : 0
    const balance = totalIncome - totalExpenses
    const savings = Math.max(0, balance)

    // 2. Fetch recent transactions (last 10)
    const recentTransactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(10)

    // 3. Expenses by Category
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
          total: { $sum: "$amount" }
        }
      },
      { $project: { category: "$_id", total: 1, _id: 0 } },
      { $sort: { total: -1 } }
    ])

    // 4. Fetch and compute budgets status
    const budgets = await Budget.find({ userId, month, year })
    
    // Compute total spent per category
    const categorySpent = await Transaction.aggregate([
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
          total: { $sum: "$amount" }
        }
      }
    ])

    const categorySpentMap = {}
    categorySpent.forEach(item => {
      categorySpentMap[item._id] = item.total
    })

    let totalBudgetLimit = 0
    let totalBudgetSpent = 0
    let budgetsExceeded = 0

    const budgetsData = budgets.map(b => {
      const spent = categorySpentMap[b.category] || 0
      totalBudgetLimit += b.monthlyLimit
      totalBudgetSpent += spent
      if (spent > b.monthlyLimit) {
        budgetsExceeded++
      }

      return {
        id: b._id,
        category: b.category,
        monthly_limit: b.monthlyLimit,
        spent: spent
      }
    })

    const remainingBudget = Math.max(0, totalBudgetLimit - totalBudgetSpent)

    // 5. Calculate monthly growth (compared to previous month)
    const prevMonthStart = new Date(year, month - 2, 1)
    const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999)
    const prevTotalResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: prevMonthStart, $lte: prevMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } }
        }
      }
    ])
    const prevMonthIncome = prevTotalResult.length > 0 ? prevTotalResult[0].income : 0
    let monthlyGrowth = 0
    if (prevMonthIncome > 0) {
      monthlyGrowth = ((totalIncome - prevMonthIncome) / prevMonthIncome) * 100
    } else if (totalIncome > 0) {
      monthlyGrowth = 100 // 100% growth since last month had 0
    }

    // 6. Calculate overall balance (all-time current balance)
    const allTimeResult = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      }
    ])
    const currentBalance = allTimeResult.length > 0 ? allTimeResult[0].income - allTimeResult[0].expenses : 0

    // 7. Calculate Financial Health Score
    const financialHealthScore = calculateFinancialHealth(totalIncome, totalExpenses, budgetsExceeded)

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        totalIncome,
        totalExpenses,
        balance: currentBalance, // total current balance
        periodBalance: balance, // balance for this selected month
        savings,
        remainingBudget,
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
        financialHealthScore,
        recentTransactions: recentTransactions.map(t => ({
          id: t._id,
          type: t.type,
          category: t.category,
          amount: t.amount,
          date: t.date,
          notes: t.notes,
          createdAt: t.createdAt
        })),
        expensesByCategory: categoryBreakdown,
        budgets: budgetsData,
        filterType: req.query.startDate && req.query.endDate ? "dateRange" : "monthYear",
        filterInfo: req.query.startDate && req.query.endDate ? 
          { startDate: req.query.startDate, endDate: req.query.endDate } :
          { month, year }
      }
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get all transactions for a specific user with pagination, sorting, and filtering
router.get("/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    
    const month = req.query.month ? parseInt(req.query.month) : null
    const year = req.query.year ? parseInt(req.query.year) : null
    const type = req.query.type || "" // income, expense
    const search = req.query.search || ""

    const filter = { userId }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      filter.date = { $gte: startDate, $lte: endDate }
    }

    if (type) {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { merchant: { $regex: search, $options: "i" } }
      ]
    }

    const totalTransactions = await Transaction.countDocuments(filter)
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      data: {
        userId,
        transactions: transactions.map(t => ({
          id: t._id,
          type: t.type,
          category: t.category,
          amount: t.amount,
          date: t.date,
          notes: t.notes,
          merchant: t.merchant,
          paymentMethod: t.paymentMethod,
          tags: t.tags,
          receiptUrl: t.receiptUrl,
          createdAt: t.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions,
          limit
        },
        filters: { month, year, type, search }
      }
    })
  } catch (error) {
    console.error("Transactions listing error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Add a new transaction (generic endpoint)
router.post("/transactions", async (req, res) => {
  try {
    const { user_id, type, category, amount, date, notes, merchant, paymentMethod, tags, receiptUrl } = req.body

    if (!user_id || !type || !category || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, type, category, amount, date"
      })
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ success: false, error: "Type must be either income or expense" })
    }

    const txAmount = parseFloat(amount)
    if (isNaN(txAmount) || txAmount <= 0) {
      return res.status(400).json({ success: false, error: "Amount must be a positive number" })
    }

    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    // Verify balance if it's an expense
    if (type === "expense") {
      const balanceResult = await Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(user_id) } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
            totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
          }
        }
      ])
      const balance = balanceResult.length > 0 ? balanceResult[0].totalIncome - balanceResult[0].totalExpenses : 0
      if (txAmount > balance) {
        return res.status(400).json({
          success: false,
          error: `Insufficient balance. Available balance: ₹${balance.toFixed(2)}, Transaction amount: ₹${txAmount.toFixed(2)}`
        })
      }
    }

    const newTx = new Transaction({
      userId: user_id,
      type,
      category,
      amount: txAmount,
      date: new Date(date),
      notes,
      merchant,
      paymentMethod: paymentMethod || "Cash",
      tags: tags || [],
      receiptUrl
    })

    await newTx.save()

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      data: {
        id: newTx._id,
        user_id,
        type,
        category,
        amount: txAmount,
        date: newTx.date,
        notes: newTx.notes
      }
    })
  } catch (error) {
    console.error("Add transaction error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Update a transaction (generic endpoint)
router.put("/transactions/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params
    const { type, category, amount, date, notes, user_id, merchant, paymentMethod, tags, receiptUrl } = req.body

    const tx = await Transaction.findOne({ _id: transactionId, userId: user_id })
    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found or does not belong to this user" })
    }

    const parsedAmount = amount !== undefined ? parseFloat(amount) : tx.amount
    if (amount !== undefined && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      return res.status(400).json({ success: false, error: "Amount must be a positive number" })
    }

    // Verify balance changes if updating amount/type to expense
    const oldType = tx.type
    const oldAmount = tx.amount

    if (type !== undefined) tx.type = type
    if (category !== undefined) tx.category = category
    if (amount !== undefined) tx.amount = parsedAmount
    if (date !== undefined) tx.date = new Date(date)
    if (notes !== undefined) tx.notes = notes
    if (merchant !== undefined) tx.merchant = merchant
    if (paymentMethod !== undefined) tx.paymentMethod = paymentMethod
    if (tags !== undefined) tx.tags = tags
    if (receiptUrl !== undefined) tx.receiptUrl = receiptUrl
    tx.updatedAt = Date.now()

    // Calculate dynamic check
    const currentBalance = await getCurrentBalance(user_id)
    let tempBalance = currentBalance
    // Revert old transaction impact
    if (oldType === "income") tempBalance -= oldAmount
    else tempBalance += oldAmount

    // Apply new transaction impact
    if (tx.type === "income") tempBalance += tx.amount
    else tempBalance -= tx.amount

    if (tempBalance < 0) {
      return res.status(400).json({
        success: false,
        error: `Transaction update would result in a negative balance (₹${tempBalance.toFixed(2)})`
      })
    }

    await tx.save()

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: tx
    })
  } catch (error) {
    console.error("Update transaction error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Delete a transaction (generic endpoint)
router.delete("/transactions/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params
    const userId = req.query.user_id

    if (!userId) {
      return res.status(400).json({ success: false, error: "Valid user_id query param is required" })
    }

    const tx = await Transaction.findOne({ _id: transactionId, userId })
    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found or does not belong to this user" })
    }

    // If it's an income, check if deleting it causes a negative balance
    if (tx.type === "income") {
      const balance = await getCurrentBalance(userId)
      if (balance - tx.amount < 0) {
        return res.status(400).json({
          success: false,
          error: "Deleting this income transaction is not allowed as it would result in a negative balance."
        })
      }
    }

    await Transaction.deleteOne({ _id: transactionId })

    res.json({
      success: true,
      message: "Transaction deleted successfully"
    })
  } catch (error) {
    console.error("Delete transaction error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get user info
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select("-password -refreshToken")
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error("Fetch user error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get spending summary by month for charts (multi-month view)
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const monthsCount = parseInt(req.query.months) || 6

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    let startDate, endDate
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate)
      endDate = new Date(req.query.endDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const today = new Date()
      startDate = new Date(today.getFullYear(), today.getMonth() - monthsCount + 1, 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    const results = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    const summary = results.map(r => {
      const monthDate = new Date(r._id.year, r._id.month - 1, 1)
      const monthName = monthDate.toLocaleString("default", { month: "long" })
      return {
        year: r._id.year,
        month: r._id.month,
        month_name: monthName,
        income: r.income,
        expense: r.expense,
        balance: r.income - r.expense
      }
    })

    res.json({
      success: true,
      data: {
        userId,
        userName: user.name,
        summary,
        filterType: req.query.startDate && req.query.endDate ? "dateRange" : "monthly",
        months: monthsCount
      }
    })
  } catch (error) {
    console.error("Summary query error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

module.exports = router
