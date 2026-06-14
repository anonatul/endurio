import cron from 'node-cron';
import { getValidToken } from '../utils/stravaToken.js';
import { syncUserActivities } from '../services/stravaServices.js';
import { query } from '../db/pool.js';

const syncAllUsers = async () => {
    const usersRes = await query('SELECT id FROM users');
    const users = await usersRes.rows;

    for(const { id: userId } of users) {
        try {
            const token = await getValidToken(userId);
            const count = await syncUserActivities(userId, token);
            console.log(` - User ${userId}: synced ${count} activities`);
        } catch (error) {
            console.error(`Sync for user ${userId} failed:`, error.message);
        };
    };
};

const initCronJobs = () => {
    // I LEARNT: 
    // cron jobs do not have access to req (request) and res (response) objects 
    // because they are triggered automatically by a time scheduler, 
    // not by an HTTP request from a client browser    
    cron.schedule('0 2 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Starting activity sync for all users`);
        await syncAllUsers();
        console.log(`[${new Date().toISOString()}] Activity sync complete`);
    });
};

export default initCronJobs;
