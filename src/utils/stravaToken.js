import { query } from "../db/pool.js";

export const getValidToken = async (userId) => {
    const tokenResult = await query('SELECT access_token, refresh_token, expires_at FROM strava_tokens WHERE user_id = $1', [userId]);

    if(tokenResult.rows.length === 0) {
        throw new Error('No strava token found for user');
    }

    const { access_token, refresh_token, expires_at } = tokenResult.rows[0];

    const db_access_token = access_token;
    const db_refresh_token = refresh_token;
    const expiresAtSec = Math.floor(new Date(expires_at).getTime() / 1000);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fiveMinutes = 300;

    if(expiresAtSec < (nowInSeconds + fiveMinutes)) {
        
        const refreshResponse = await fetch('https://www.strava.com/api/v3/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                refresh_token: db_refresh_token,
                grant_type: 'refresh_token'
            })
        }).then(response => {
            if(!response.ok) throw new Error('Failed to get access token');
            return response.json();
        });
        
        const { access_token, refresh_token, expires_at } = refreshResponse;
        await query('UPDATE strava_tokens SET access_token = $1, refresh_token = $2, expires_at = to_timestamp($3) WHERE user_id = $4', [access_token, refresh_token, expires_at, userId]);

        return access_token;
    }

    return db_access_token;
}