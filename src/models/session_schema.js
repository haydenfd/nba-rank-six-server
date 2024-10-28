import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        session_id: { type: String },
        session_status: { type: Number, default: 0 },
        players: {
            type: [
                {
                    PLAYER_NAME: { type: String, required: true },
                    PLAYER_ID: { type: String, required: true },
                    CODE: { type: String, required: true},
                    PPG: { type: Number, required: true},
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
