import pool, { query } from "../db/pool.js";
import { getUserProfile } from "../services/userService.js";
import { generateTrainingPlan } from "../services/aiCoachService.js";

export const createTrainingPlan = async (req, res) => {
    const { userId } = req.session;

    // todo:  get the user preference from request body 

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const userProfile = await getUserProfile(userId);
        const trainingPlan = await generateTrainingPlan(userProfile);

        const goal = userProfile.goals.primary_goal;
        const raceDate = userProfile.goals.goal_race_date;
        const durationWeeks = userProfile.goals.duration_weeks;
        const currentWeek = 1;
        const rawPlan = trainingPlan;
        const planStatus = 'active';

        const insertTrainingPlanQuery = `
                                    INSERT INTO plans (user_id, goal, race_date, duration_weeks, current_week, raw_plan, status)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                                    RETURNING id, goal, race_date, duration_weeks, current_week, raw_plan, status;
        `;

        console.log('Writing Plan to DB...');
        const client = await pool.connect();
        try {

            await client.query('BEGIN');

            await client.query(`UPDATE plans SET status = 'archived', updated_at = NOW()
                                WHERE user_id = $1 AND status = 'active';
                `, [userId]);

            const planResult = await client.query(insertTrainingPlanQuery, [userId, goal, raceDate, durationWeeks, currentWeek, rawPlan, planStatus]);

            console.log('Plan Inserted!!');

            await client.query('COMMIT');
            res.status(200).json({
                plan: planResult.rows[0]
            });
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error('DB Insert failed:', dbError.message);
            res.status(500).json({
                error: "Failed to save training plan to database."
            });
        } finally {
            client.release();
        };

    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            error: "Failed to create training plan."
        });
    };
};

export const getActivePlan = async (req, res) => {
    const { userId } = req.session;

    if(!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    const getActivePlanQuery = `SELECT goal, race_date, duration_weeks, current_week, status, created_at, updated_at, raw_plan FROM plans
                                WHERE user_id = $1 AND status = 'active'
                                ORDER BY created_at DESC
                                LIMIT 1;
                                `;
    
    try {
        const result = await query(getActivePlanQuery, [userId]);
        const plan = result.rows[0];

        if(!plan) return res.status(200).json({ plan: null });

        res.status(200).json({ plan });
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            error: "Failed to get training plan."
        });
    }
}