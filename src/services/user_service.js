import User from '../models/user_schema.js';

async function checkIfUserIdExistsService(user_id) {
    const user = await User.findOne({ user_id });
    return !!user;
}

async function addUserService(user_id) {
    try {
        const newUser = new User({ user_id });
        await newUser.save();
        return true;
    } catch (error) {
        console.error('Error adding user: ', error);
        return false;
    }
}

async function fetchUserStatsService(user_id) {
    try {
        const user = await User.findOne({ user_id });

        if (!user) return null;

        return {
            games_played: user.games_played,
            wins: user.wins,
            longest_streak: user.longest_streak,
            current_streak: user.current_streak,
            attempts_distribution: user.attempts_distribution,
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export { checkIfUserIdExistsService, addUserService, fetchUserStatsService };
