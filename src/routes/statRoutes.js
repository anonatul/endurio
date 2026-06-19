import express from 'express';
import { query } from '../db/pool.js';
import { getActivitySummary, getLongestRun, getWeeklyMileage, getRunningConsistency, getFastest5K } from '../controllers/statsController.js';

const router = express.Router();

router.get("/weekly-mileage", getWeeklyMileage);
router.get("/summary", getActivitySummary);
router.get("/longest-run", getLongestRun);
router.get("/running-consistency", getRunningConsistency);
router.get("/fastest-5k", getFastest5K);

export default router;