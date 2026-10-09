const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*)::int AS total_tasks,
                COUNT(*) FILTER (
                    WHERE status = 'completed'
                )::int AS completed_tasks,
                COUNT(*) FILTER (
                    WHERE status = 'pending'
                )::int AS pending_tasks,
                COUNT(*) FILTER (
                    WHERE status = 'in_progress'
                )::int AS in_progress_tasks,
                COUNT(*) FILTER (
                    WHERE due_date < CURRENT_DATE
                    AND status != 'completed'
                )::int AS overdue_tasks
            FROM tasks
        `);

        res.status(200).json({
            success: true,
            message: "Dashboard statistics fetched successfully",
            dashboard: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

module.exports = { getDashboardStats };