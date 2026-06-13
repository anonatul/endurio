import { query } from "../db/pool.js";
import { syncUserActivities } from "../services/stravaServices.js";
import { getValidToken } from "../utils/stravaToken.js";

export const syncActivities = async (req, res) => {

    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const token = await getValidToken(userId);
        const count = await syncUserActivities(userId, token);

        res.json({
            success: true,
            synced: `Successfully synced ${count} activities`
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Sync failed: ' + error.message
        });
    };

};

export const getActivities = async (req ,res) => {
    const { userId } = req.session;
    const activityId = req.params.id;
    
    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        let data;

        if(activityId) {
            data = await query('SELECT id, user_id, strava_activity_id, sport_type, start_date, start_date_local, distance, moving_time, elapsed_time, average_speed, max_speed, average_heartrate, max_heartrate, total_elevation_gain, workout_type, created_at FROM activities WHERE user_id = $1 AND id = $2', [userId, activityId]);
        } else {
            data = await query('SELECT id, user_id, strava_activity_id, sport_type, start_date, start_date_local, distance, moving_time, elapsed_time, average_speed, max_speed, average_heartrate, max_heartrate, total_elevation_gain, workout_type, created_at FROM activities WHERE user_id = $1 ORDER BY start_date_local DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
        }

        if(activityId && data.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Activity not found"
            });
        }
        
        res.status(200).json({
            success: true,
            pageCount: data.rows.length,
            activities: data.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve activities: ' + error.message
        });
    };
}