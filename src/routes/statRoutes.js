import express from 'express';
import { getWeeklyMileage, 
    getActivitySummary, 
    getLongestRun, 
    getRunningConsistency, 
    getFastest5K, 
    getFastest10K,
    getDashboardData
  } from '../controllers/statsController.js';

const router = express.Router();

router.get("/weekly-mileage", getWeeklyMileage);
router.get("/summary", getActivitySummary);
router.get("/longest-run", getLongestRun);
router.get("/running-consistency", getRunningConsistency);
router.get("/fastest-5k", getFastest5K);
router.get("/fastest-10k", getFastest10K);

router.get("/dashboard", getDashboardData);

export default router;