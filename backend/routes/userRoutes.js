const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}, "name email");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;