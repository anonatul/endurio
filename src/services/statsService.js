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
    // what is learned here:
    // when calculating avg pace, for that we divide with SUM(distance),
    // now if SUM(distance) is 0, then we will get divide by zero error, 
    // so we use NULLIF(SUM(distance), 0) to avoid that error - 
    // it will return NULL if SUM(distance) is 0, and then the whole expression will return NULL instead of throwing an error.
     
    const queryText = `SELECT COUNT(*) AS total_runs, SUM(distance)/1000 AS total_distance, ROUND(SUM(moving_time)/3600.0, 1) AS total_hours, SUM(moving_time) / 60.0 / (NULLIF(SUM(distance), 0) / 1000) AS avg_pace_per_km, AVG(average_heartrate) AS avg_hr 
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
};

export const fetchFastest5K = async (userId) => {
    const queryText = ` SELECT distance, ROUND(moving_time/60.0, 2), start_date_local
                       FROM activities
                       WHERE user_id = $1 AND sport_type = 'Run' AND distance >= 5000
                       ORDER BY moving_time ASC LIMIT 1;
    `;
    try {
        const response = await query(queryText, [userId]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch fastest 5K");
    };
};

export const fetchFastest10K = async (userId) => {
    const queryText = ` SELECT distance, ROUND(moving_time/60.0, 2), start_date_local
                       FROM activities
                       WHERE user_id = $1 AND sport_type = 'Run' AND distance >= 10000
                       ORDER BY moving_time ASC LIMIT 1;
    `;
    try {
        const response = await query(queryText, [userId]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch fastest 10K");
    };
};

export const fetchRecentRuns = async (userId, limit) => {
    const queryText = `SELECT start_date_local, distance, moving_time, average_speed, max_speed, elapsed_time, average_heartrate, max_heartrate, total_elevation_gain
                       FROM activities
                       WHERE user_id = $1 AND sport_type = 'Run'
                       ORDER BY start_date_local DESC
                       LIMIT $2;
    `;
    try {
        const response = await query(queryText, [userId, limit]);
        return response.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch recent runs");
    };
};