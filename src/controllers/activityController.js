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
        const count = await syncUserActivities(userId, token);

        res.json({
            success: true,
            synced: `Successfully synced ${count} activities`
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Sync failed: ' + error.message
        });
    };

};