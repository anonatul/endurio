import { query } from "../db/pool.js";

// Weekly mileage for last N weeks 
export const getWeeklyMileage = async (req, res) => {
    const { userId } = req.session;
    const weeks = req.query.weeks;

    if(!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const data = await query("SELECT DATE_TRUNC('week', start_date_local) AS week_start, SUM(distance) / 1000 AS distance_km FROM activities WHERE user_id = $1 AND sport_type = 'Run' GROUP BY week_start ORDER BY week_start DESC LIMIT $2;", [userId, weeks]);

        res.status(200).json({
            success: true,
            weekly_mileage: data.rows
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch weekly mileage"
        });
    };
};