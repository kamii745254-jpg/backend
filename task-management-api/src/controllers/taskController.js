const pool = require("../config/db");

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            due_date,
            project_id,
            user_id
        } = req.body;

        if (!title || !project_id || !user_id) {
            return res.status(400).json({
                success: false,
                message: "Title, project_id and user_id are required"
            });
        }

        const project = await pool.query(
            "SELECT id FROM projects WHERE id = $1",
            [project_id]
        );

        if (project.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const user = await pool.query(
            "SELECT id FROM users WHERE id = $1",
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO tasks
            (title, description, status, priority, due_date, project_id, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                title,
                description || null,
                status || "pending",
                priority || "medium",
                due_date || null,
                project_id,
                user_id
            ]
        );

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23514") {
            return res.status(400).json({
                success: false,
                message: "Invalid status or priority value"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message
        });
    }
};

// GET ALL TASKS

const getTasks = async (req, res) => {
    try {
        const {
            status,
            priority,
            search,
            project_id,
            user_id,
            page = 1,
            limit = 10,
            sortBy = "created_at",
            order = "DESC",
            overdue
        } = req.query;

        const allowedSortFields = [
            "created_at",
            "updated_at",
            "due_date",
            "title",
            "priority",
            "status"
        ];

        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "created_at";

        const sortOrder = order.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            100
        );
        const offset = (currentPage - 1) * pageSize;

        let query = `
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.due_date,
                t.project_id,
                p.name AS project_name,
                t.user_id,
                u.name AS user_name,
                u.email AS user_email,
                t.created_at,
                t.updated_at,
                (t.due_date < CURRENT_DATE AND t.status != 'completed')
                    AS is_overdue
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN users u ON t.user_id = u.id
            WHERE 1 = 1
        `;

        const values = [];
        let index = 1;

        if (status) {
            query += ` AND t.status = $${index++}`;
            values.push(status);
        }

        if (priority) {
            query += ` AND t.priority = $${index++}`;
            values.push(priority);
        }

        if (search) {
            query += ` AND (
                t.title ILIKE $${index}
                OR t.description ILIKE $${index}
            )`;
            values.push(`%${search}%`);
            index++;
        }

        if (project_id) {
            query += ` AND t.project_id = $${index++}`;
            values.push(project_id);
        }

        if (user_id) {
            query += ` AND t.user_id = $${index++}`;
            values.push(user_id);
        }

        if (overdue === "true") {
            query += ` AND t.due_date < CURRENT_DATE
                       AND t.status != 'completed'`;
        } else if (overdue === "false") {
            query += ` AND (
                t.due_date IS NULL
                OR t.due_date >= CURRENT_DATE
                OR t.status = 'completed'
            )`;
        }

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM (${query}) AS filtered_tasks
        `;

        const countResult = await pool.query(countQuery, values);
        const totalTasks = countResult.rows[0].total;

        query += ` ORDER BY t.${sortField} ${sortOrder} NULLS LAST`;
        query += ` LIMIT $${index++} OFFSET $${index}`;

        values.push(pageSize, offset);

        const result = await pool.query(query, values);

        res.json({
            success: true,
            pagination: {
                totalTasks,
                currentPage,
                totalPages: Math.ceil(totalTasks / pageSize),
                pageSize
            },
            count: result.rows.length,
            tasks: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};

// GET TASK BY ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.due_date,
                t.project_id,
                p.name AS project_name,
                t.user_id,
                u.name AS user_name,
                u.email AS user_email,
                t.created_at,
                t.updated_at
             FROM tasks t
             JOIN projects p ON t.project_id = p.id
             JOIN users u ON t.user_id = u.id
             WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            task: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: error.message
        });
    }
};

// UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            status,
            priority,
            due_date
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const result = await pool.query(
            `UPDATE tasks
             SET
                title = $1,
                description = $2,
                status = $3,
                priority = $4,
                due_date = $5,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [
                title,
                description || null,
                status || "pending",
                priority || "medium",
                due_date || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task updated successfully",
            task: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23514") {
            return res.status(400).json({
                success: false,
                message: "Invalid status or priority value"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });
    }
};

// DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM tasks
             WHERE id = $1
             RETURNING id, title`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task deleted successfully",
            task: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};