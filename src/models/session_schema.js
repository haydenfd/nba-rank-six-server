import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        session_id: { type: String, required: true },
        session_status: { type: Number, default: 0 },
        players: {
            type: [
                {
                    PLAYER_NAME: { type: String, required: true },
                    PLAYER_ID: { type: String, required: true },
                    FROM_YEAR: { type: Number },
                    TO_YEAR: { type: Number },
                    PPG: { type: Number },
                    GP: { type: Number },
                    EXP: { type: Number },
                },
            ],
        },
        attempts: { type: Number, default: 0 },
        solution_map: {
            type: Map,
            of: String,
        },
    },
    { collection: 'rank-five-sessions' },
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
