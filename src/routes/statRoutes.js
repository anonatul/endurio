import express from 'express';
import { query } from '../db/pool.js';
import { getWeeklyMileage } from '../controllers/statsController.js';

const router = express.Router();

router.get("/weekly-mileage", getWeeklyMileage);

export default router;