import express from 'express';
import { query } from '../db/pool.js';
import { getActivitySummary, getLongestRun, getWeeklyMileage } from '../controllers/statsController.js';

const router = express.Router();

router.get("/weekly-mileage", getWeeklyMileage);
router.get("/summary", getActivitySummary);
router.get("/longest-run", getLongestRun);

export default router;