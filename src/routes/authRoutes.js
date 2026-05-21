import express, { response } from 'express';


const router = express.Router();

router.get("/strava", async (req, res) => {
    const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=read,activity:read_all`;
    res.redirect(STRAVA_AUTH_URL);
});


// ToDo - add error handling
router.get("/strava/callback", async (req, res) => {
    const authCode = req.query.code;

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
    }).then(response => response.json());

    // need to remove this as it responding the token to the client, browsers
    res.json({
        data
    });

    // ToDo - Store token info and athelete info directly to Database
});

export default router;