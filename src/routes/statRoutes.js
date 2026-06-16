import express from 'express';
import { query } from '../db/pool.js';
import { getActivitySummary, getWeeklyMileage } from '../controllers/statsController.js';

const router = express.Router();

router.get("/weekly-mileage", getWeeklyMileage);
router.get("/summary", getActivitySummary);

export default router;