import { exchangeCodeForToken } from '../services/stravaServices.js';
import { query } from '../db/pool.js';

export const stravaAuthCallback = async (req, res) => {
    try{
        const authCode = req.query.code;
        const error = req.query.error;

        if(error === 'access_denied') {
            return res.status(403).json({
                error: 'User denied authorization'
            });
        }

        if(!authCode) {
            return res.status(400).json({
                error: 'No authorization code provided'
            });
        }

        const userId = await exchangeCodeForToken(authCode);

        req.session.userId = userId;

        const userProfile = await query('SELECT profile FROM users WHERE id = $1', [userId]);

        if(userProfile.rows.length > 0 && userProfile.rows[0].profile) {
            res.redirect(`${process.env.CLIENT_URL}/dashboard`);
        } else {
            res.redirect(`${process.env.CLIENT_URL}/onboard`);
        }


    } catch(error) { 
        console.error('Error in Strava auth callback:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}