import express from 'express';
import { createTrainingPlan, getActivePlan } from '../controllers/planController.js';

const router = express.Router();

router.get("/", getActivePlan);
router.post("/", createTrainingPlan);

export default router;