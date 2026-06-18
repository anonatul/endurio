import { query } from "../db/pool.js";

export const fetchWeeklyMileage = async (userId, weeks) => {
    const queryText = `SELECT DATE_TRUNC('week', start_date_local) AS week_start, SUM(distance) / 1000 AS distance_km 
                       FROM activities 
                       WHERE user_id = $1 AND sport_type = 'Run' 
                       GROUP BY week_start ORDER BY week_start DESC LIMIT $2;
    `;

    try {
        const response = await query(queryText, [userId, weeks]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch weekly mileage");
    };
};

export const fetchAcitivitySummary = async (userId, days) => {
    const queryText = `SELECT COUNT(*) AS total_runs, SUM(distance)/1000 AS total_distance, ROUND(SUM(moving_time)/3600.0, 1) AS total_hours, SUM(moving_time) / 60.0 / (SUM(distance) / 1000) AS avg_pace_per_km, AVG(average_heartrate) AS avg_hr 
                       FROM activities 
                       WHERE user_id = $1 AND sport_type = 'Run' AND start_date_local >= NOW() - ( $2 * INTERVAL '1 day' );
    `;

    try {
        const response = await query(queryText, [userId, days]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch activites summary");
    };
};

export const fetchLongestRun = async (userId, weeks) => {
    const queryText = `
               SELECT distance
               FROM activities 
               WHERE user_id = $1 AND sport_type = 'Run' AND start_date_local >= NOW() - ($2 * INTERVAL '1 week')
               ORDER BY distance DESC LIMIT 1;   
    `;

    try {
        const response = await query(queryText, [userId, weeks]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch longest run");
    };
};

export const fetchRunningConsistency = async (userId, weeks) => {
    const queryText = `SELECT COUNT(*) 
                       FROM activities
                       WHERE user_id = $1 AND sport_type = 'Run' AND start_date_local >= NOW() - ($2 * INTERVAL '1 week');
    `;

    try {
        const response = await query(queryText, [userId, weeks]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch Running Consistency");
    };
}