import express from 'express';
import { getChatResponse } from '../controllers/aiCoachController.js';

const router = express.Router();

router.post("/ask", getChatResponse);

export default router;