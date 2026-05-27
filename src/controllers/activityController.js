import { syncUserActivities } from "../services/stravaServices.js";
import { getValidToken } from "../utils/stravaToken.js";


export const syncActivities = async (req, res) => {

    const { userId } = req.session;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    try {
        const token = await getValidToken(userId);
        // const count = await syncUserActivities(token);

        const activity = await syncUserActivities(token);

        res.json({
            success: true,
            synced: activity
        })

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Sync failed'
        });
    };

};