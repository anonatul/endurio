import express from 'express';
import { query } from '../db/pool.js';
import { saveUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/onboard', saveUserProfile);
router.get('/profile', async(req, res) => {
    const { userId } = req.session;
    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    const userProfile = await query('SELECT name, email, profile FROM users WHERE id = $1', [userId]);

    res.status(200).json({
        status: "success",
        data: {
            name: userProfile.rows[0].name,
            email: userProfile.rows[0].email,
            profile: userProfile.rows[0].profile
        }
    });
});

export default router;