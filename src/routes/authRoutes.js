import express from 'express';
import { query } from '../db/pool.js';
import { stravaAuthCallback } from '../controllers/authController.js';

const router = express.Router();

router.get("/strava", async (req, res) => {
    const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=read,activity:read_all`;
    res.redirect(STRAVA_AUTH_URL);
});

router.get("/strava/callback", stravaAuthCallback);

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({
                error: "Failed to logout"
            });
        }

        res.clearCookie('connect.sid');
        
        res.status(200).json({
            status: "success",
            message: "Logged out successfully"
        });
    });
});

export default router;