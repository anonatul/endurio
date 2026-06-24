import express from 'express';
import { getChatResponse, getTrainingPlan } from '../controllers/aiCoachController.js';

const router = express.Router();

router.post("/ask", getChatResponse);
router.post("/generate-plan", getTrainingPlan);

export default router;