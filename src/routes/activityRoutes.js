import express from 'express';
import { syncActivities } from '../controllers/activityController.js';

const router = express.Router();

router.get("/sync", syncActivities);

export default router;