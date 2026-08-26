import { query } from '../db/pool.js';
import pool from '../db/pool.js';

export const exchangeCodeForToken = async (authCode) => {
    
    const client = await pool.connect();

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

        try {
            await client.query('BEGIN');
            
            await client.query('DELETE FROM strava_tokens WHERE user_id = $1', [userId]);
            await client.query('INSERT INTO strava_tokens (user_id, access_token, refresh_token, expires_at) VALUES ($1, $2, $3, to_timestamp($4))', [userId, access_token, refresh_token, expires_at]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error storing tokens in the database:', error);
            throw new Error('Failed to store tokens in the database');
        }

        return userId;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw new Error('Failed to exchange code for token');
    } finally {
        client.release();
    }
};

/** 
 * This function will fetch all activities of the user from strava, 
 * and return an array of activities
 * after that it will store the activities in the database, 
 * if the activity already exists it will update it, otherwise it will insert a new one 
 **/
export const syncUserActivities = async (userId, token) => {

    const client = await pool.connect();

    try {

        // ----------------------------------------------------------
        // |             Fetching activities from Strava          |
        // ----------------------------------------------------------
        let page = 1;
        const perPage = 200;
        let length = Infinity;

        let allActivities = [];

        console.log('Starting to sync Strava activities...');
        console.log(`Fetching activities for userId: ${userId} with token: ${token}`);
        while (length !== 0) {

            const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${String(token)}`
                }
            });

            

            if(!res.ok) {
                throw new Error(`Strava API responded with status ${res.status}`);
            }

            const activities = await res.json();

            length = activities.length;
            page++;

            allActivities.push(...activities);
            console.log(`Fetched ${length} activities from Strava (Page ${page - 1})`);
        }


        // ----------------------------------------------------------
        // |             Storing activities in the database         |
        // ----------------------------------------------------------
        // for now i just query the database to upsert the activities 1 by 1,
        // but in the future i will optimize this by using bulk insert or upsert
        await client.query('BEGIN');

        for (const activity of allActivities) {
            const {
                id,
                sport_type,
                start_date,
                start_date_local,
                distance,
                moving_time,
                elapsed_time,
                average_speed,
                max_speed,
                average_heartrate,
                max_heartrate,
                has_heartrate,
                total_elevation_gain,
                workout_type
            } = activity;

            await client.query(`
                    INSERT INTO activities (user_id, strava_activity_id, sport_type, start_date, start_date_local, distance, moving_time, elapsed_time, average_speed, max_speed, average_heartrate, max_heartrate, total_elevation_gain, workout_type, raw_json)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    ON CONFLICT (strava_activity_id)
                    DO UPDATE
                    SET
                        sport_type = EXCLUDED.sport_type,
                        start_date = EXCLUDED.start_date,
                        start_date_local = EXCLUDED.start_date_local,
                        distance = EXCLUDED.distance,
                        moving_time = EXCLUDED.moving_time,
                        elapsed_time = EXCLUDED.elapsed_time,
                        average_speed = EXCLUDED.average_speed,
                        max_speed = EXCLUDED.max_speed,
                        average_heartrate = EXCLUDED.average_heartrate,
                        max_heartrate = EXCLUDED.max_heartrate,
                        total_elevation_gain = EXCLUDED.total_elevation_gain,
                        workout_type = EXCLUDED.workout_type,
                        raw_json = EXCLUDED.raw_json
                    RETURNING id
                    `, [userId, id.toString(), sport_type, start_date, start_date_local, distance, moving_time, elapsed_time, average_speed, max_speed, average_heartrate, max_heartrate, total_elevation_gain, workout_type, JSON.stringify(activity)]);

        };

        await client.query('COMMIT');
        console.log(`Successfully synced ${allActivities.length} activities from Strava!`);

        return allActivities.length;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error syncing strava activities: ', error);
        throw new Error('Failed to sync activities');
    } finally {
        client.release();
    }
};