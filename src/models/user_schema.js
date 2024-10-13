import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, unique: true },
        games_played: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        longest_streak: { type: Number, default: 0 },
        current_streak: { type: Number, default: 0 },
        attempts_distribution: { type: [Number], default: [0, 0, 0] },
    },
    { collection: 'rank-five-users' },
);

const User = mongoose.model('User', userSchema);

export default User;
