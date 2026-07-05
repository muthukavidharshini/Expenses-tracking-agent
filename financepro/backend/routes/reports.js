const express = require("express")
const router = express.Router()
const Transaction = require("../models/Transaction")
const User = require("../models/User")
const Budget = require("../models/Budget")
const mongoose = require("mongoose")
const XLSX = require("xlsx")

// Get Financial Summary Report for a specific user
router.get("/financial-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params
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

    // 1. Totals (income and expenses)
    const totalsResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total_income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          total_expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          income_transactions: { $sum: { $cond: [{ $eq: ["$type", "income"] }, 1, 0] } },
          expense_transactions: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, 1, 0] } }
        }
      }
    ])

    const totalIncome = totalsResult.length > 0 ? totalsResult[0].total_income : 0
    const totalExpenses = totalsResult.length > 0 ? totalsResult[0].total_expenses : 0
    const balance = totalIncome - totalExpenses
    const income_transactions = totalsResult.length > 0 ? totalsResult[0].income_transactions : 0
    const expense_transactions = totalsResult.length > 0 ? totalsResult[0].expense_transactions : 0
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

    // 2. Monthly breakdown
    const monthlyBreakdownResult = await Transaction.aggregate([
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
          monthly_income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          monthly_expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ])

    const monthlyBreakdown = monthlyBreakdownResult.map(m => {
      const monthDate = new Date(m._id.year, m._id.month - 1, 1)
      return {
        year: m._id.year,
        month: m._id.month,
        month_name: monthDate.toLocaleString("default", { month: "long" }),
        monthly_income: m.monthly_income,
        monthly_expenses: m.monthly_expenses,
        balance: m.monthly_income - m.monthly_expenses
      }
    })

    const avgMonthlyIncome = monthlyBreakdown.length > 0
      ? monthlyBreakdown.reduce((sum, m) => sum + m.monthly_income, 0) / monthlyBreakdown.length
      : 0
    const avgMonthlyExpenses = monthlyBreakdown.length > 0
      ? monthlyBreakdown.reduce((sum, m) => sum + m.monthly_expenses, 0) / monthlyBreakdown.length
      : 0

    // 3. Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          transaction_count: { $sum: 1 },
          average_amount: { $avg: "$amount" }
        }
      },
      {
        $project: {
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
          transaction_count: 1,
          average_amount: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ])

    // 4. Daily pattern (Average expense per day of week)
    const dailyPattern = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: "$date" } },
          avg_daily_expense: { $avg: "$amount" },
          expense_count: { $sum: 1 }
        }
      },
      {
        $project: {
          day_number: "$_id.dayOfWeek",
          avg_daily_expense: 1,
          expense_count: 1,
          _id: 0
        }
      },
      { $sort: { day_number: 1 } }
    ])

    // Map day numbers (1 = Sunday, 7 = Saturday) to names
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dailyPatternFormatted = dailyPattern.map(d => ({
      day_number: d.day_number,
      day_name: dayNames[d.day_number - 1],
      avg_daily_expense: parseFloat(d.avg_daily_expense.toFixed(2)),
      expense_count: d.expense_count
    }))

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email },
        summary: {
          totalIncome,
          totalExpenses,
          balance,
          savingsRate: parseFloat(savingsRate.toFixed(2)),
          incomeTransactions: income_transactions,
          expenseTransactions: expense_transactions,
          avgMonthlyIncome: parseFloat(avgMonthlyIncome.toFixed(2)),
          avgMonthlyExpenses: parseFloat(avgMonthlyExpenses.toFixed(2))
        },
        monthlyBreakdown,
        categoryBreakdown,
        dailyPattern: dailyPatternFormatted,
        filterInfo: req.query.startDate && req.query.endDate ?
          { startDate: req.query.startDate, endDate: req.query.endDate, type: "dateRange" } :
          { month, year, type: "monthYear" }
      }
    })
  } catch (error) {
    console.error("Financial Summary Report error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get Category Analysis Report
router.get("/category-analysis/:userId", async (req, res) => {
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

    const categories = await Transaction.aggregate([
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
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" }
        }
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          count: 1,
          avgAmount: 1,
          minAmount: 1,
          maxAmount: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ])

    res.json({
      success: true,
      data: {
        userId,
        userName: user.name,
        month,
        year,
        categories
      }
    })
  } catch (error) {
    console.error("Category analysis report error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Get comparison report (Current vs Compare month)
router.get("/comparison/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const currentMonth = parseInt(req.query.month) || new Date().getMonth() + 1
    const currentYear = parseInt(req.query.year) || new Date().getFullYear()

    // Compare with last month by default
    let compareMonth = currentMonth - 1
    let compareYear = currentYear
    if (compareMonth === 0) {
      compareMonth = 12
      compareYear = currentYear - 1
    }

    if (req.query.compareMonth && req.query.compareYear) {
      compareMonth = parseInt(req.query.compareMonth)
      compareYear = parseInt(req.query.compareYear)
    }

    const currentStart = new Date(currentYear, currentMonth - 1, 1)
    const currentEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

    const compareStart = new Date(compareYear, compareMonth - 1, 1)
    const compareEnd = new Date(compareYear, compareMonth, 0, 23, 59, 59, 999)

    // Current period stats
    const currentResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: currentStart, $lte: currentEnd }
        }
      },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          income_count: { $sum: { $cond: [{ $eq: ["$type", "income"] }, 1, 0] } },
          expense_count: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, 1, 0] } }
        }
      }
    ])

    // Comparison period stats
    const comparisonResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: compareStart, $lte: compareEnd }
        }
      },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          income_count: { $sum: { $cond: [{ $eq: ["$type", "income"] }, 1, 0] } },
          expense_count: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, 1, 0] } }
        }
      }
    ])

    const cur = currentResult.length > 0 ? currentResult[0] : { income: 0, expenses: 0, income_count: 0, expense_count: 0 }
    const comp = comparisonResult.length > 0 ? comparisonResult[0] : { income: 0, expenses: 0, income_count: 0, expense_count: 0 }

    const incomeChange = comp.income > 0 ? ((cur.income - comp.income) / comp.income) * 100 : 0
    const expenseChange = comp.expenses > 0 ? ((cur.expenses - comp.expenses) / comp.expenses) * 100 : 0

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email },
        periods: {
          current: { month: currentMonth, year: currentYear },
          comparison: { month: compareMonth, year: compareYear }
        },
        summary: {
          current: {
            income: cur.income,
            expenses: cur.expenses,
            balance: cur.income - cur.expenses,
            income_count: cur.income_count,
            expense_count: cur.expense_count
          },
          comparison: {
            income: comp.income,
            expenses: comp.expenses,
            balance: comp.income - comp.expenses,
            income_count: comp.income_count,
            expense_count: comp.expense_count
          },
          changes: {
            income_change: parseFloat(incomeChange.toFixed(2)),
            expense_change: parseFloat(expenseChange.toFixed(2)),
            balance_change: parseFloat(((cur.income - cur.expenses) - (comp.income - comp.expenses)).toFixed(2))
          }
        }
      }
    })
  } catch (error) {
    console.error("Comparison report error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Download reports in CSV, Excel or HTML
router.get("/download/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const format = req.query.format || "csv" // csv, excel

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 })

    // Clean data for reports
    const reportData = transactions.map(t => ({
      Type: t.type.toUpperCase(),
      Category: t.category,
      Amount: t.amount,
      Date: t.date.toISOString().split("T")[0],
      Merchant: t.merchant || "-",
      "Payment Method": t.paymentMethod,
      Notes: t.notes || ""
    }))

    if (format === "excel") {
      // Excel Export using xlsx library
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")
      
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      res.setHeader("Content-Disposition", `attachment; filename=FinancePro_Report_${userId}.xlsx`)
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      return res.send(buffer)
    } else {
      // CSV Export
      let csvContent = "Type,Category,Amount,Date,Merchant,Payment Method,Notes\n"
      reportData.forEach(row => {
        csvContent += `"${row.Type}","${row.Category}",${row.Amount},"${row.Date}","${row.Merchant}","${row["Payment Method"]}","${row.Notes.replace(/"/g, '""')}"\n`
      })

      res.setHeader("Content-Disposition", `attachment; filename=FinancePro_Report_${userId}.csv`)
      res.setHeader("Content-Type", "text/csv")
      return res.send(csvContent)
    }
  } catch (error) {
    console.error("Download report error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Test route for reports
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Reports API is working!",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "GET /api/reports/financial-summary/:userId",
      "GET /api/reports/category-analysis/:userId",
      "GET /api/reports/comparison/:userId",
      "GET /api/reports/download/:userId"
    ]
  })
})

module.exports = router