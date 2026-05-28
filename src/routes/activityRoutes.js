import express from 'express';
import { syncActivities } from '../controllers/activityController.js';

const router = express.Router();

router.post("/sync", syncActivities);

export default router;