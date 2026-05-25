import { query } from '../db/pool.js';

export const exchangeCodeForToken = async (authCode) => {
    try {
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

                return userId;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw new Error('Failed to exchange code for token');
    }
};