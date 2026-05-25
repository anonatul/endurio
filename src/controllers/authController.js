import { exchangeCodeForToken } from '../services/stravaServices.js';

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

        res.json({
            message: 'Successfully authorized!',
        });

    } catch(error) { 
        console.error('Error in Strava auth callback:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}