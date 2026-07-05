const express = require("express")
const router = express.Router()
const Goal = require("../models/Goal")
const User = require("../models/User")

// Get all goals for a specific user
router.get("/goal/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 })

    res.json({
      success: true,
      data: goals
    })
  } catch (error) {
    console.error("Fetch goals error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Add a new goal
router.post("/goal", async (req, res) => {
  try {
    const { user_id, name, targetAmount, currentAmount, desiredDate, category } = req.body

    if (!user_id || !name || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, name, targetAmount"
      })
    }

    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const newGoal = new Goal({
      userId: user_id,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      desiredDate: desiredDate ? new Date(desiredDate) : null,
      category: category || "General"
    })

    await newGoal.save()

    res.status(201).json({
      success: true,
      message: "Goal added successfully",
      data: newGoal
    })
  } catch (error) {
    console.error("Add goal error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Update a goal (e.g., adding savings to currentAmount)
router.put("/goal/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params
    const { currentAmount, targetAmount, name, desiredDate, category, user_id } = req.body

    const goal = await Goal.findOne({ _id: goalId, userId: user_id })
    if (!goal) {
      return res.status(404).json({ success: false, error: "Goal not found or does not belong to this user" })
    }

    if (name !== undefined) goal.name = name
    if (targetAmount !== undefined) goal.targetAmount = parseFloat(targetAmount)
    if (currentAmount !== undefined) goal.currentAmount = parseFloat(currentAmount)
    if (desiredDate !== undefined) goal.desiredDate = desiredDate ? new Date(desiredDate) : null
    if (category !== undefined) goal.category = category

    await goal.save()

    res.json({
      success: true,
      message: "Goal updated successfully",
      data: goal
    })
  } catch (error) {
    console.error("Update goal error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Delete a goal
router.delete("/goal/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params
    const userId = req.query.user_id

    if (!userId) {
      return res.status(400).json({ success: false, error: "Valid user_id query param is required" })
    }

    const goal = await Goal.findOneAndDelete({ _id: goalId, userId })
    if (!goal) {
      return res.status(404).json({ success: false, error: "Goal not found or does not belong to this user" })
    }

    res.json({
      success: true,
      message: "Goal deleted successfully"
    })
  } catch (error) {
    console.error("Delete goal error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

module.exports = router
