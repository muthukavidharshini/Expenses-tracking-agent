const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const User = require("../models/User")

// Get all notifications for a user
router.get("/notification/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30)

    res.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error("Fetch notifications error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Mark single notification as read
router.put("/notification/read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params
    const { user_id } = req.body

    const notification = await Notification.findOne({ _id: notificationId, userId: user_id })
    if (!notification) {
      return res.status(404).json({ success: false, error: "Notification not found" })
    }

    notification.read = true
    await notification.save()

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification
    })
  } catch (error) {
    console.error("Mark read notification error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

// Mark all notifications as read for a user
router.put("/notification/read-all/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    await Notification.updateMany({ userId, read: false }, { $set: { read: true } })

    res.json({
      success: true,
      message: "All notifications marked as read"
    })
  } catch (error) {
    console.error("Mark all read notifications error:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

module.exports = router
