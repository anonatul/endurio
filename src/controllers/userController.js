import { query } from '../db/pool.js';
import { fetchWeeklyMileage, fetchRecentRuns } from '../services/statsService.js';

export const saveUserProfile = async (req, res) => {
    // check for user strava oauth, if they are not authenticated, redirect them to strava oauth page,
    // if they are authenticated just let them continue to the next process of onboarding. 
    // JUST WAITING FOR FRONTEND TO IMPLEMENT THIS ROUTE, SO I CAN TEST IT OUT

    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    };

    // For frontend-
    // athelete form - name = get from strava, age = get from strava, sex = client form, height = get from strava, weight = get from strava, years running = client form - all not nullable fields
    // goals form - primary goal = client form (Half Marathon, Marathon, 5k, 10k, general fitness), if gneral fitness is selected then (goal_race_date, goal_time can be null), duration_weeks = defualt = 12, start_date = client form  
    // availability form - days_per_week = client form, preferred_rest_day = client form, max_time_weekday_min = client form, max_time_weekend_min = client form, strength_training_days = client form (array of days) - all not nullable fields
    // injuries form - current_injury = client form (boolean), past_injuries = client form (array of objects with injury, year, severity) - all not nullable fields
    // recent races form - if user has done races we will ask otherwise we will skip this form 
    const { athlete, goals, availability, injuries, recent_races } = req.body;

    try {

        const weeklyMileageHistory = await fetchWeeklyMileage(userId, 8);
        const recentRuns = await fetchRecentRuns(userId, 5);

        const userProfile = {
            athlete,
            goals,
            availability,
            injuries,
            recent_races,
            weekly_mileage_history: weeklyMileageHistory,
            recent_runs: recentRuns
        };

        await query('UPDATE users SET profile = $1 WHERE id = $2', [JSON.stringify(userProfile), userId]);

        res.status(200).json({
            success: true,
            message: 'User profile saved successfully',
            data: userProfile
        });
    } catch (error) {
        console.error('Error saving user profile:', error);
        res.status(500).json({ error: 'Failed to save user profile' });
    }
};

export const getUserProfile = async (userId) => {
    
    const fetchUserProfileQuery = `SELECT profile FROM users WHERE id = $1`;
    try {
        const result = await query(fetchUserProfileQuery, [userId]);

        if(!result || result.rows.length === 0) {
            throw new Error('User profile not found');
        };

        return result.rows[0].profile;

    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
    };
};