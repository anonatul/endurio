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

// This function will fetch all activities of the user from strava, and return an array of activities
// I will implement the logic to store these activities in the database later, 
// for now I just want to test if I can fetch the activities from strava successfully
export const syncUserActivities = async (token) => {
    try {
        let page = 1;
        const perPage = 200;
        let length = Infinity;

        let allActivities = [];

        console.log('Starting to sync Strava activities...');
        while(length !== 0) {
            
            const activities = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${String(token)}`
                }
            }).then(res => res.json());

            length = activities.length;
            page++;

            allActivities.push(...activities);
            console.log(`Fetched ${length} activities from Strava (Page ${page - 1})`);
        }

        const {
            id,
            sport_type,
            start_date,
            distance,
            moving_time,
            elapsed_time,
            average_speed,
            max_speed,
            has_heartrate,
            total_elevation_gain,
            workout_type
        } = allActivities[0];

        return {
            id,
            sport_type,
            start_date,
            distance,
            moving_time,
            elapsed_time,
            average_speed,
            max_speed,
            has_heartrate,
            total_elevation_gain,
            workout_type
        };
    } catch (error) {
        console.error('Error syncing strava activites: ', error);
    }
};