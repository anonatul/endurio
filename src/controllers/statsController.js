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

// Summary of activities for last N days
export const getActivitySummary = async (req, res) => {
    const { userId } = req.session;
    const days = req.query.days || 30;

    if(!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        // what i added for summary now:
        // - total runs
        // - total distance in km
        // - total hours
        // - average pace per km
        // - average heart rate
        
        // ToDo: planning to add more metrics:
        // - elevation gain
        // - longest run
        // - fastest run pace 
        // - weekly average distance
        // - average run distance
        
        const data = await query(`SELECT COUNT(*) AS total_runs, SUM(distance)/1000 AS total_distance, ROUND(SUM(moving_time)/3600.0, 1)  AS total_hours, SUM(moving_time) / 60.0 / (SUM(distance) / 1000) AS avg_pace_per_km, AVG(average_heartrate) AS avg_hr from activities WHERE user_id = $1 AND sport_type = 'Run' AND start_date_local >= NOW() - INTERVAL '${days} days';`, [userId]);

        res.status(200).json({
            success: true,
            summary: data.rows
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch summary data"
        });
    }
}