import express from 'express';
import { getChatResponse, getTrainingPlan } from '../controllers/aiCoachController.js';

const router = express.Router();

router.post("/ask", getChatResponse);
router.get("/generate-plan", getTrainingPlan);

export default router;