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

const updateUserStatsWonSessionService = async (user_id, attempts) => {
    const user_stats = await fetchUserStatsService(user_id);

    const newCurrentStreak = user_stats.current_streak + 1;

    try {
        const updateStatus = await User.updateOne(
            {
                user_id: user_id,
            },
            {
                $inc: {
                    games_played: 1,
                    wins: 1,
                    [`attempts_distribution.${attempts - 1}`]: 1,
                },
                $set: {
                    current_streak: newCurrentStreak,
                },
                $max: {
                    longest_streak: newCurrentStreak,
                },
            },
        );

        return updateStatus.acknowledged;
    } catch (error) {
        return false;
    }
};

const updateUserStatsLostSessionService = async (user_id) => {
    try {
        const updateStatus = await User.updateOne(
            {
                user_id: user_id,
            },
            {
                $inc: {
                    games_played: 1,
                },
                $set: {
                    current_streak: 0,
                },
            },
        );

        return updateStatus.acknowledged;
    } catch (error) {
        return false;
    }
};

export { checkIfUserIdExistsService, addUserService, fetchUserStatsService, updateUserStatsLostSessionService, updateUserStatsWonSessionService };
