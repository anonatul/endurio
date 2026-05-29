import express from 'express';
import { getActivities, syncActivities } from '../controllers/activityController.js';

const router = express.Router();

router.get("/", getActivities);
router.get("/:id", getActivities);
router.post("/sync", syncActivities);

export default router;