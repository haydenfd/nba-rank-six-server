import mongoose from 'mongoose';

const playersSchema = new mongoose.Schema(
    {
        PLAYER_NAME: { type: String, required: true },
        PLAYER_ID: { type: String, required: true, unique: true },
        FROM_YEAR: { type: Number, required: true },
        TO_YEAR: { type: Number, required: true },
        PPG: { type: Number, required: true },
        GP: { type: Number, required: true },
        EXP: { type: Number, required: true },
    },
    { strict: true, collection: 'rank-five-players' },
);

const Players = mongoose.model('Players', playersSchema);

export default Players;
