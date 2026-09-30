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