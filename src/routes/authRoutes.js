import express, { response } from 'express';


const router = express.Router();

router.get("/strava", async (req, res) => {
    const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=read,activity:read_all`;
    res.redirect(STRAVA_AUTH_URL);
});


// ToDo - add error handling
router.get("/strava/callback", async (req, res) => {

    try {
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
        if(!response.ok) throw new Error('Failed to exchange token with Strava');
        return response.json();
    });

    res.json({
        message: 'Successfully authorized!',
        data
    });
    // ToDo - Store token info and athelete info directly to Database

    } catch (error) {
        console.error("Strava OAuth Error:", error);
        res.status(500).json({
            error: 'Internal Server Error during Strava authentication'
        });
    }
});

export default router;