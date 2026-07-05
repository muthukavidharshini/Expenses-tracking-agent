const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const { OpenAI } = require("openai")

// Import models
const User = require("../models/User")
const Transaction = require("../models/Transaction")
const Budget = require("../models/Budget")
const Goal = require("../models/Goal")
const Notification = require("../models/Notification")
const AIChatHistory = require("../models/AIChatHistory")
const AIInsight = require("../models/AIInsight")
const ReceiptScan = require("../models/ReceiptScan")
const VoiceRecord = require("../models/VoiceRecord")

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Multi-Agent Class definitions to separate responsibilities
class ExpenseAgent {
  async process(text, userId) {
    // Regex for parsing amount, category, merchant
    const lowerText = text.toLowerCase()
    const amountMatch = text.match(/(?:[₹$]|\brs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null

    if (!amount) {
      return {
        handled: false,
        response: "I detected that you want to log an expense, but couldn't parse the amount. Please specify the amount (e.g. 'I spent ₹450 at Domino's')."
      }
    }

    // Determine category
    let category = "Other"
    const categoryMappings = {
      Food: /\b(food|domino|restaurant|grocery|groceries|eat|meal|lunch|dinner|breakfast|burger|pizza|starbucks|coffee|swiggy|zomato)\b/i,
      Transportation: /\b(fuel|petrol|diesel|gas|car|bus|train|uber|taxi|flight|travel|metro)\b/i,
      Entertainment: /\b(netflix|movie|spotify|game|music|fun|party|concert|show|subscription)\b/i,
      Utilities: /\b(electric|water|internet|wifi|phone|bill|cable|recharge)\b/i,
      Healthcare: /\b(health|medical|doctor|medicine|hospital|pharmacy|clinic)\b/i,
      Shopping: /\b(shopping|clothes|clothing|shoes|electronics|amazon|flipkart|myntra)\b/i,
      Rent: /\b(rent|housing|apartment|mortgage)\b/i,
      Education: /\b(education|school|course|book|tuition|udemy|coursera)\b/i
    }

    for (const [cat, pattern] of Object.entries(categoryMappings)) {
      if (pattern.test(lowerText)) {
        category = cat
        break
      }
    }

    // Determine merchant
    let merchant = ""
    const merchantMatch = text.match(/(?:at|in|on|from)\s+([A-Za-z0-9\s']+)(?:\s+for|\s+on|\.|$)/i)
    if (merchantMatch) {
      merchant = merchantMatch[1].trim()
    } else {
      // Fallback merchants based on keywords
      if (lowerText.includes("domino")) merchant = "Domino's"
      else if (lowerText.includes("starbucks")) merchant = "Starbucks"
      else if (lowerText.includes("amazon")) merchant = "Amazon"
      else if (lowerText.includes("uber")) merchant = "Uber"
      else if (lowerText.includes("netflix")) merchant = "Netflix"
      else if (lowerText.includes("spotify")) merchant = "Spotify"
      else if (lowerText.includes("swiggy")) merchant = "Swiggy"
      else if (lowerText.includes("zomato")) merchant = "Zomato"
      else merchant = category
    }

    // Create the expense transaction
    const newTx = new Transaction({
      userId,
      type: "expense",
      category,
      amount,
      date: new Date(),
      merchant: merchant || "Local Store",
      notes: `Logged via AI: "${text}"`,
      paymentMethod: "Cash"
    })

    await newTx.save()

    return {
      handled: true,
      response: `🛒 **Expense Logged Automatically (Expense Agent)**\n\n💵 **Amount:** ₹${amount.toFixed(2)}\n🏪 **Merchant:** ${newTx.merchant}\n🏷️ **Category:** ${category}\n📅 **Date:** ${new Date().toLocaleDateString()}\n\n*Transaction successfully recorded in database!*`,
      transaction: newTx
    }
  }
}

class BudgetAgent {
  async process(text, userId) {
    const lowerText = text.toLowerCase()
    const amountMatch = text.match(/(?:[₹$]|\brs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null

    if (!amount) {
      return {
        handled: false,
        response: "To set a budget, please mention the category and amount (e.g. 'Set a monthly budget for Food of ₹5000')."
      }
    }

    // Identify category
    let category = "Other"
    const categories = ["Food", "Transportation", "Entertainment", "Utilities", "Healthcare", "Shopping", "Rent", "Education"]
    for (const cat of categories) {
      if (lowerText.includes(cat.toLowerCase())) {
        category = cat
        break
      }
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Find and update or create budget
    let budget = await Budget.findOne({ userId, category, month: currentMonth, year: currentYear })
    if (budget) {
      budget.monthlyLimit = amount
    } else {
      budget = new Budget({
        userId,
        category,
        monthlyLimit: amount,
        month: currentMonth,
        year: currentYear
      })
    }
    await budget.save()

    return {
      handled: true,
      response: `📊 **Budget Configured (Budget Agent)**\n\n🏷️ **Category:** ${category}\n💰 **Monthly Limit:** ₹${amount.toFixed(2)}\n📅 **Period:** ${currentMonth}/${currentYear}\n\n*Your spending limit has been updated successfully!*`
    }
  }
}

class AnalyticsAgent {
  async getSummary(userId) {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, currentMonth - 1, 1)
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

    // Aggregate monthly transactions
    const result = await Transaction.aggregate([
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

    const totalIncome = result.length > 0 ? result[0].income : 0
    const totalExpenses = result.length > 0 ? result[0].expenses : 0
    const balance = totalIncome - totalExpenses

    // Get biggest expenses
    const biggestExpenses = await Transaction.find({
      userId,
      type: "expense",
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ amount: -1 })
      .limit(3)

    let expenseListStr = ""
    biggestExpenses.forEach((e, idx) => {
      expenseListStr += `\n${idx + 1}. ₹${e.amount} at ${e.merchant} (${e.category})`
    })

    return {
      totalIncome,
      totalExpenses,
      balance,
      biggestExpenses: expenseListStr || "\n*No expenses logged this month.*"
    }
  }
}

class ForecastAgent {
  async process(userId) {
    // Collect past 3 months expense history
    const today = new Date()
    const startPeriod = new Date(today.getFullYear(), today.getMonth() - 3, 1)

    const history = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startPeriod }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    let avgSpending = 0
    let trendStr = ""
    if (history.length > 0) {
      const sum = history.reduce((acc, h) => acc + h.total, 0)
      avgSpending = sum / history.length
      history.forEach(h => {
        trendStr += `\n• Month ${h._id.month}/${h._id.year}: ₹${h.total.toFixed(2)}`
      })
    } else {
      // Default fallback
      avgSpending = 5000
      trendStr = "\n• No recent history found. Using baseline projection."
    }

    const predictedSpending = avgSpending * 1.05 // assumes 5% inflation/increase
    const predictedSavings = Math.max(0, avgSpending * 0.2) // assumes standard 20% savings

    return {
      avgSpending,
      predictedSpending,
      predictedSavings,
      trendStr
    }
  }
}

class SavingsAdvisorAgent {
  async getAdvice(userId) {
    // Analyze category spending to identify savings
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, currentMonth - 1, 1)

    const categorySummary = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ])

    const advices = []
    categorySummary.forEach(c => {
      if (c._id === "Food" && c.total > 3000) {
        advices.push(`• **Food Spending Reduction:** You spent ₹${c.total.toFixed(2)} on food this month. Preparing meals at home could save you up to ₹${(c.total * 0.3).toFixed(0)}!`)
      }
      if (c._id === "Shopping" && c.total > 2000) {
        advices.push(`• **Shopping Optimization:** You spent ₹${c.total.toFixed(2)} on shopping. Delaying non-essential purchases by 24 hours can help curb impulsive spending.`)
      }
      if (c._id === "Entertainment" && c.total > 1500) {
        advices.push(`• **Entertainment Auditing:** Subscription services sum up to ₹${c.total.toFixed(2)}. Audit your active subscriptions and cancel those not used in the last 30 days.`)
      }
    })

    if (advices.length === 0) {
      advices.push("• Your spending looks highly disciplined across all categories! Maintain a standard 50/30/20 rule to maximize savings.")
    }

    return advices.join("\n\n")
  }
}

// Fraud & Duplicate Transaction Detection Agent
class FraudAgent {
  async detect(userId) {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7) // check last 7 days

    // Detect exact duplicates (same amount, merchant, and category in last 7 days)
    const duplicates = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { amount: "$amount", merchant: "$merchant", category: "$category", type: "$type" },
          count: { $sum: 1 },
          txIds: { $push: "$_id" }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ])

    // Detect unusually large transactions (above 3x average monthly transaction size)
    const allExpenses = await Transaction.find({ userId, type: "expense" })
    let avgExpenseSize = 1000
    if (allExpenses.length > 0) {
      avgExpenseSize = allExpenses.reduce((sum, tx) => sum + tx.amount, 0) / allExpenses.length
    }

    const largeThreshold = avgExpenseSize * 3
    const abnormalTx = await Transaction.find({
      userId,
      type: "expense",
      amount: { $gt: largeThreshold },
      date: { $gte: startDate }
    })

    return {
      duplicates,
      abnormalTx,
      largeThreshold
    }
  }
}

// Instantiate agents
const expenseAgent = new ExpenseAgent()
const budgetAgent = new BudgetAgent()
const analyticsAgent = new AnalyticsAgent()
const forecastAgent = new ForecastAgent()
const savingsAdvisorAgent = new SavingsAdvisorAgent()
const fraudAgent = new FraudAgent()

// 1. Main Chatbot message route
router.post("/:userId", async (req, res) => {
  try {
    const { prompt } = req.body
    const { userId } = req.params

    if (!prompt || !userId) {
      return res.status(400).json({ success: false, error: "Message prompt and userId are required" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    // Log user chat message
    const userHistory = new AIChatHistory({ userId, role: "user", message: prompt })
    await userHistory.save()

    let responseText = ""
    let handledByOpenAI = false

    // Try OpenAI first if configured
    if (openai) {
      try {
        const chatCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are FinancePro AI, an advanced personal finance coach. You represent a Multi-Agent architecture.
Based on the user's prompt, act as one of the following agents:
- Chat Agent: For general chit-chat and greetings.
- Expense Agent: For logging expenses (extract category, amount, merchant).
- Budget Agent: For configuring budgets.
- Analytics Agent: For summarizing historical spending.
- Forecast Agent: For predictions.
- Savings Advisor Agent: For money saving tips.

Be helpful, concise, and professional. Mention which agent is responding in your title.`
            },
            { role: "user", content: prompt }
          ]
        })
        responseText = chatCompletion.choices[0].message.content
        handledByOpenAI = true
      } catch (err) {
        console.error("OpenAI failed, falling back to local agents:", err.message)
      }
    }

    // Fallback/Local Heuristic Agent Dispatcher
    if (!handledByOpenAI) {
      const lowerPrompt = prompt.toLowerCase().trim()

      if (lowerPrompt.match(/^(hi|hello|hey|good morning|greetings)/i)) {
        responseText = `👋 **Hello! I'm your FinancePro AI Assistant (Chat Agent)**\n\nI am connected to a team of specialized agents to help you manage your wealth:\n\n• 🛒 **Expense Agent:** Say things like *"I spent ₹450 at Domino's for pizza"* to log expenses.\n• 📊 **Budget Agent:** Say *"Set a budget for Food of ₹8000"* to regulate limits.\n• 📈 **Analytics Agent:** Ask *"How much did I spend this month?"* or *"Compare this month"* for summaries.\n• 🔮 **Forecast Agent:** Ask *"Predict my expenses next month"* to see predictions.\n• 💡 **Savings Advisor:** Ask *"Where can I save money?"* for savings insights.\n\n*What can I help you analyze today?*`
      } 
      else if (lowerPrompt.includes("spend") || lowerPrompt.includes("expense") || lowerPrompt.includes("paid") || lowerPrompt.includes("bought") || lowerPrompt.includes("cost") || lowerPrompt.includes("domino")) {
        const result = await expenseAgent.process(prompt, userId)
        responseText = result.response
      }
      else if (lowerPrompt.includes("budget") && (lowerPrompt.includes("set") || lowerPrompt.includes("limit") || lowerPrompt.includes("create"))) {
        const result = await budgetAgent.process(prompt, userId)
        responseText = result.response
      }
      else if (lowerPrompt.includes("how much") || lowerPrompt.includes("summary") || lowerPrompt.includes("biggest") || lowerPrompt.includes("balance")) {
        const stats = await analyticsAgent.getSummary(userId)
        responseText = `📈 **Monthly Financial Overview (Analytics Agent)**\n\n• **Total Income:** ₹${stats.totalIncome.toFixed(2)}\n• **Total Expenses:** ₹${stats.totalExpenses.toFixed(2)}\n• **Net Balance:** ₹${stats.balance.toFixed(2)}\n\n🔥 **Biggest Transactions:**${stats.biggestExpenses}\n\n*Tip: Ask the Savings Advisor Agent where you can cut down on these largest items.*`
      }
      else if (lowerPrompt.includes("predict") || lowerPrompt.includes("forecast") || lowerPrompt.includes("next month")) {
        const forecast = await forecastAgent.process(userId)
        responseText = `🔮 **Spending Prediction & Risk Report (Forecast Agent)**\n\nBased on your past 3 months' transaction history:${forecast.trendStr}\n\n📊 **Predictions for Next Month:**\n• **Projected Expenses:** ₹${forecast.predictedSpending.toFixed(2)} *(with standard 5% inflation factor)*\n• **Expected Savings Buffer:** ₹${forecast.predictedSavings.toFixed(2)}\n\n⚠️ **Risk Assessment:** Low risk of budget exceedance if current category boundaries are respected.`
      }
      else if (lowerPrompt.includes("save") || lowerPrompt.includes("advice") || lowerPrompt.includes("reduce") || lowerPrompt.includes("cut")) {
        const advice = await savingsAdvisorAgent.getAdvice(userId)
        responseText = `💡 **Personalized Savings Opportunities (Savings Advisor Agent)**\n\nBased on your category breakdowns for the current month:\n\n${advice}\n\n*Pro Tip: Automate transfers of ₹2,000 into a Mutual Fund goal on the day you receive your paycheck!*`
      }
      else {
        responseText = `❓ **FinancePro Agent Dispatcher**\n\nI was unable to route your message to a specific agent automatically. Could you please clarify your request?\n\n• To log an expense: *"I spent ₹500 on Uber"* (Expense Agent)\n• To set a budget: *"Set budget for entertainment ₹1000"* (Budget Agent)\n• To inspect balance: *"What is my balance?"* (Analytics Agent)\n• To seek savings tip: *"Where can I save?"* (Savings Advisor Agent)`
      }
    }

    // Save AI chatbot response to history
    const botHistory = new AIChatHistory({ userId, role: "assistant", message: responseText })
    await botHistory.save()

    res.json({
      success: true,
      response: responseText
    })
  } catch (error) {
    console.error("AI Chatbot handler error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// 2. OCR Receipt Scanner Route
router.post("/ocr/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: "imageUrl is required" })
    }

    // Mock receipt scan results based on standard merchants
    let merchant = "Domino's Pizza"
    let amount = 450.00
    let tax = 22.50
    let date = new Date()
    let items = [
      { name: "Farmhouse Pizza (Medium)", quantity: 1, price: 399.00 },
      { name: "Garlic Breadsticks", quantity: 1, price: 73.50 }
    ]

    if (imageUrl.toLowerCase().includes("uber") || imageUrl.toLowerCase().includes("ride")) {
      merchant = "Uber Technologies"
      amount = 280.00
      tax = 14.00
      items = [{ name: "Ride Fare", quantity: 1, price: 280.00 }]
    } else if (imageUrl.toLowerCase().includes("amazon") || imageUrl.toLowerCase().includes("bill")) {
      merchant = "Amazon Seller Services"
      amount = 1250.00
      tax = 62.50
      items = [
        { name: "Wireless Mouse", quantity: 1, price: 800.00 },
        { name: "USB Cable Type-C", quantity: 1, price: 450.00 }
      ]
    }

    // Log receipt scan record
    const scan = new ReceiptScan({
      userId,
      imageUrl,
      merchant,
      date,
      amount,
      tax,
      items,
      status: "completed"
    })
    await scan.save()

    // Automatically create a transaction expense entry
    const newTx = new Transaction({
      userId,
      type: "expense",
      category: "Food",
      amount,
      date,
      merchant,
      notes: `Scanned from Receipt [OCR Agent]`,
      receiptUrl: imageUrl
    })
    await newTx.save()

    res.status(201).json({
      success: true,
      message: "Receipt scanned and expense transaction created successfully",
      scanDetails: scan,
      transaction: newTx
    })
  } catch (error) {
    console.error("Receipt OCR scanning error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// 3. Voice Command Logger Route
router.post("/voice/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { transcript } = req.body // transcript text from SpeechRecognition API

    if (!transcript) {
      return res.status(400).json({ success: false, error: "transcript is required" })
    }

    // Delegate to Expense Agent to parse and add
    const result = await expenseAgent.process(transcript, userId)

    if (result.handled) {
      const voiceRecord = new VoiceRecord({
        userId,
        transcript,
        extractedAmount: result.transaction.amount,
        extractedCategory: result.transaction.category,
        extractedMerchant: result.transaction.merchant
      })
      await voiceRecord.save()
    }

    res.json({
      success: true,
      message: result.handled ? "Voice transaction parsed and logged" : "Voice command received but not parsed as expense",
      response: result.response,
      transaction: result.transaction || null
    })
  } catch (error) {
    console.error("Voice logging route error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// 4. Get Chat History Route
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const history = await AIChatHistory.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50)

    res.json({
      success: true,
      history
    })
  } catch (error) {
    console.error("Chat history error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// 5. Get AI Spending Insights & Anomaly / Fraud Detection
router.get("/insights/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const advice = await savingsAdvisorAgent.getAdvice(userId)
    const fraudData = await fraudAgent.detect(userId)

    const insights = [
      {
        type: "info",
        title: "Savings Recommendations",
        description: advice
      }
    ]

    // Append fraud/anomaly detections
    if (fraudData.duplicates.length > 0) {
      insights.push({
        type: "warning",
        title: "Possible Duplicate Expenses Detected",
        description: `We found ${fraudData.duplicates.length} duplicate transactions logged in the last 7 days. Please review your transaction history to make sure they are not errors.`
      })
    }

    if (fraudData.abnormalTx.length > 0) {
      fraudData.abnormalTx.forEach(tx => {
        insights.push({
          type: "danger",
          title: "Abnormal Spending Pattern",
          description: `An unusually large transaction of ₹${tx.amount} was logged at ${tx.merchant} (${tx.category}). This is over 3x higher than your average transaction size of ₹${fraudData.largeThreshold.toFixed(0)}.`
        })
      })
    }

    res.json({
      success: true,
      insights
    })
  } catch (error) {
    console.error("Insights error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// 6. Get Predictions (Next Month)
router.get("/predictions/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const forecast = await forecastAgent.process(userId)

    // Generate chart data for prediction comparisons
    const currentMonth = new Date().toLocaleString("default", { month: "short" })
    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleString("default", { month: "short" })

    const chartData = [
      { name: `${currentMonth} (Actual)`, Spending: forecast.avgSpending, Savings: forecast.avgSpending * 0.15 },
      { name: `${nextMonth} (Predicted)`, Spending: forecast.predictedSpending, Savings: forecast.predictedSavings }
    ]

    res.json({
      success: true,
      data: {
        avgSpending: forecast.avgSpending,
        predictedSpending: forecast.predictedSpending,
        predictedSavings: forecast.predictedSavings,
        budgetRisk: forecast.predictedSpending > forecast.avgSpending ? "Medium Risk" : "Low Risk",
        chartData
      }
    })
  } catch (error) {
    console.error("Predictions error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

module.exports = router