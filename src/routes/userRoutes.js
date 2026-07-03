import express from 'express';
import { saveUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/onboard', saveUserProfile);

export default router;