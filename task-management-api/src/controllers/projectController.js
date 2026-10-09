const pool = require("../config/db");

// CREATE PROJECT
const createProject = async (req, res) => {
    try {
        const { name, description, user_id } = req.body;

        if (!name || !user_id) {
            return res.status(400).json({
                success: false,
                message: "Project name and user_id are required"
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
            `INSERT INTO projects (name, description, user_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, description || null, user_id]
        );

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message
        });
    }
};

// GET ALL PROJECTS
const getProjects = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                p.id,
                p.name,
                p.description,
                p.user_id,
                u.name AS owner_name,
                u.email AS owner_email,
                p.created_at
             FROM projects p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.id DESC`
        );

        res.json({
            success: true,
            count: result.rows.length,
            projects: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};

// GET PROJECT BY ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                p.id,
                p.name,
                p.description,
                p.user_id,
                u.name AS owner_name,
                u.email AS owner_email,
                p.created_at
             FROM projects p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            project: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch project",
            error: error.message
        });
    }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Project name is required"
            });
        }

        const result = await pool.query(
            `UPDATE projects
             SET name = $1, description = $2
             WHERE id = $3
             RETURNING *`,
            [name, description || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            message: "Project updated successfully",
            project: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: error.message
        });
    }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM projects
             WHERE id = $1
             RETURNING id, name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            message: "Project deleted successfully",
            project: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete project",
            error: error.message
        });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};