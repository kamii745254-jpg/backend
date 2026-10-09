
const express = require("express");

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all task routes with JWT authentication
router.use(authMiddleware);

// Create task
router.post("/", createTask);

// Get all tasks (search, filters, pagination, sorting)
router.get("/", getTasks);

// Get task by ID
router.get("/:id", getTaskById);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

module.exports = router;