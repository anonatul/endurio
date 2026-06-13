import express from 'express';
import { query } from '../db/pool.js';
import { stravaAuthCallback } from '../controllers/authController.js';

const router = express.Router();

router.get("/strava", async (req, res) => {
    const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=read,activity:read_all`;
    res.redirect(STRAVA_AUTH_URL);
});

router.get("/strava/callback", stravaAuthCallback);

export default router;