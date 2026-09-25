import express from 'express';
import cache from '../utils/cache.js';

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
    fetchFastest10K,
    fetchUserMetadata 
} from '../services/statsService.js';

const router = express.Router();

// todo:  need to move this on controller
const getDashboardData = async (req, res) => {
    const { userId } = req.session;
    const cacheKey = `dashboardData:${userId}`;
    
    try {

        const cached = cache.get(cacheKey);
        if(cached) {
            console.log("cached data")
            return res.json({ ...cached, cached: true  });
        };

        const [weeklyMileage, activitySummary, longestRun, runningConsistency, fastest5K, fastest10K, userMetadata] = await Promise.all([
            fetchWeeklyMileage(userId, 7),
            fetchActivitySummary(userId, 30),
            fetchLongestRun(userId, 4),
            fetchRunningConsistency(userId, 4),
            fetchFastest5K(userId),
            fetchFastest10K(userId),
            fetchUserMetadata(userId)
        ]);

        const dashboardData = {
            weeklyMileage,
            activitySummary,
            longestRun,
            runningConsistency,
            fastest5K,
            fastest10K,
            userMetadata
        };

        cache.set(cacheKey, dashboardData);
        console.log("DB call");
        res.json({
            ...dashboardData,
            cached: false
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