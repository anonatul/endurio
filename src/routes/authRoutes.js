import express, { response } from 'express';
import { query } from '../db/pool.js';


const router = express.Router();

router.get("/strava", async (req, res) => {
    const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=read,activity:read_all`;
    res.redirect(STRAVA_AUTH_URL);
});

router.get("/strava/callback", async (req, res) => {

    try {
        const authCode = req.query.code;
        const error = req.query.error;

        if (error === 'access_denied') {
            return res.status(403).json({
                error: 'User denied authorization'
            });
        }

        if (!authCode) {
            return res.status(400).json({
                error: 'No authorization code provided'
            });
        }

        const data = await fetch('https://www.strava.com/api/v3/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code: authCode,
                grant_type: 'authorization_code'
            })
        }).then(response => {
            if (!response.ok) throw new Error('Failed to exchange token with Strava');
            return response.json();
        });

        const { access_token, refresh_token, expires_at, athlete } = data;

        const userResult = await query(
            'INSERT INTO users (strava_athlete_id, name, email) VALUES ($1, $2, $3) ON CONFLICT (strava_athlete_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email RETURNING id', 
            [athlete.id.toString(), athlete.firstname + ' ' + athlete.lastname, `${athlete.firstname.toLowerCase()}.${athlete.lastname.toLowerCase()}@runloop.com`]
        );
        const userId = userResult.rows[0].id;
        
        await query('DELETE FROM strava_tokens WHERE user_id = $1', [userId]);
        await query('INSERT INTO strava_tokens (user_id, access_token, refresh_token, expires_at) VALUES ($1, $2, $3, to_timestamp($4))', [userId, access_token, refresh_token, expires_at]);

        res.json({
            message: 'Successfully authorized!',
            athlete: {
                id: athlete.id,
                name: athlete.firstname + ' ' + athlete.lastname, 
                email: `${athlete.firstname.toLowerCase()}.${athlete.lastname.toLowerCase()}@runloop.com`
            }
        });

    } catch (error) {
        console.error("Strava OAuth Error:", error);
        res.status(500).json({
            error: 'Internal Server Error during Strava authentication'
        });
    }
});

export default router;