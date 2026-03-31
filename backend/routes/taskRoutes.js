
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  updateTask,
  deleteTask,
  completeTask
} = require("../controllers/taskController");

// UPDATE TASK
router.put("/:taskId", authMiddleware, updateTask);

// DELETE TASK
router.delete("/:taskId", authMiddleware, deleteTask);

// MARK COMPLETE
router.put("/:taskId/complete", authMiddleware, completeTask);

module.exports = router;