import {
    fetchAcitivitySummary,
    fetchLongestRun,
    fetchRunningConsistency,
    fetchWeeklyMileage,
    fetchFastest5K,
    fetchFastest10K
} from "../services/statsService.js";

// Weekly mileage for last N weeks 
export const getWeeklyMileage = async (req, res) => {
    const { userId } = req.session;
    const weeks = req.query.weeks || 4;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    if (weeks <= 0 || !Number.isInteger(Number(weeks))) {
        return res.status(400).json({
            error: "Invalid weeks parameter. It must be a positive integer."
        });
    }

    try {
        // what i learned new here:
        // - DATE_TRUNC('week', start_date_local) AS week_start: this will truncate the date to the start of the week, so we can group by week
        // - SUM(distance) / 1000 AS distance_km: this will sum the distance in meters and convert it to kilometers
        // - GROUP BY week_start: this will group the results by week_start
        // - ORDER BY week_start DESC: this will order the results by week_start in descending order
        // - LIMIT $2: this will limit the results to the number of weeks specified in the query parameter
        const data = await fetchWeeklyMileage(userId, weeks);

        res.status(200).json({
            success: true,
            weekly_mileage: data
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

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    if(days <= 0 || !Number.isInteger(Number(days))) {
        return res.status(400).json({
            error: "Invalid days parameter. It must be a positive integer."
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


        // what i learned new here:
        // - SUM(distance)/1000 AS total_distance: this will sum the distance in meters and convert it to kilometers
        // - ROUND(SUM(moving_time)/3600.0, 1)  AS total_hours: this will sum the moving time in seconds and convert it to hours, rounded to 1 decimal place
        // - SUM(moving_time) / 60.0 / (SUM(distance) / 1000) AS avg_pace_per_km: this will calculate the average pace per kilometer in minutes per kilometer
        // - AVG(average_heartrate) AS avg_hr: this will calculate the average heart rate
        const data = await fetchAcitivitySummary(userId, days);

        res.status(200).json({
            success: true,
            summary: data
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch summary data"
        });
    };
};

// Longest run in last N weeks
export const getLongestRun = async (req, res) => {
    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        })
    };

    const weeks = req.query.weeks || 4;

    if (weeks <= 0 || !Number.isInteger(Number(weeks))) {
        return res.status(400).json({
            error: "Invalid weeks parameter. It must be a positive integer."
        });
    };

    try {
        const data = await fetchLongestRun(userId, weeks);

        if (data.length === 0 || data[0].distance === null) {
            return res.status(404).json({
                error: "No runs found"
            });
        }

        res.status(200).json({
            success: true,
            longest_run: data[0].distance / 1000
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch longest run"
        });
    };
};

// Get the avergae run per week for last N weeks
export const getRunningConsistency = async (req, res) => {
    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    const weeks = req.query.weeks || 4;

    if (weeks <= 0 || !Number.isInteger(Number(weeks))) {
        return res.status(400).json({
            error: "Invalid weeks parameter. It must be a positive integer."
        });
    };

    try {
        const data = await fetchRunningConsistency(userId, weeks);
        const totalRuns = parseInt(data[0].count, 10);
        const averageRunsPerWeek = parseInt(totalRuns / weeks, 10);

        res.status(200).json({
            success: true,
            weeks: weeks,
            total_runs: totalRuns,
            average_runs_per_week: averageRunsPerWeek
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch average run per weeks"
        });
    };
};

// Get the fastest time for 5K
export const getFastest5K = async (req, res) => {
    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const data = await fetchFastest5K(userId);

        if (data.length === 0 || data[0].round === null) {
            return res.status(404).json({
                error: "No 5K runs found"
            });
        }

        res.status(200).json({
            success: true,
            fastest_5k_time_minutes: data[0].round,
            date: data[0].start_date_local
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch fastest 5K time"
        });
    };
};

// Get the fastest time for 10K
export const getFastest10K = async (req, res) => {
    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const data = await fetchFastest10K(userId);

        if (data.length === 0 || data[0].round === null) {
            return res.status(404).json({
                error: "No 10K runs found"
            });
        }

        res.status(200).json({
            success: true,
            fastest_10k_time_minutes: data[0].round,
            date: data[0].start_date_local
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Failed to fetch fastest 10K time"
        });
    };
}