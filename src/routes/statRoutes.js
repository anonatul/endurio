import express from 'express';
import { getWeeklyMileage, 
    getActivitySummary, 
    getLongestRun, 
    getRunningConsistency, 
    getFastest5K, 
    getFastest10K
  } from '../controllers/statsController.js';

import { fetchWeeklyMileage, 
    fetchActivitySummary, 
    fetchLongestRun, 
    fetchRunningConsistency, 
    fetchFastest5K, 
    fetchFastest10K 
} from '../services/statsService.js';

const router = express.Router();

const getDashboardData = async (req, res) => {
    const { userId } = req.session;
    
    try {

        const [weeklyMileage, activitySummary, longestRun, runningConsistency, fastest5K, fastest10K] = await Promise.all([
            fetchWeeklyMileage(userId, 4),
            fetchActivitySummary(userId, 30),
            fetchLongestRun(userId, 4),
            fetchRunningConsistency(userId, 4),
            fetchFastest5K(userId),
            fetchFastest10K(userId)
        ]);

        res.json({
            weeklyMileage,
            activitySummary,
            longestRun,
            runningConsistency,
            fastest5K,
            fastest10K
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    };
}

router.get("/weekly-mileage", getWeeklyMileage);
router.get("/summary", getActivitySummary);
router.get("/longest-run", getLongestRun);
router.get("/running-consistency", getRunningConsistency);
router.get("/fastest-5k", getFastest5K);
router.get("/fastest-10k", getFastest10K);

router.get("/dashboard", getDashboardData);

export default router;