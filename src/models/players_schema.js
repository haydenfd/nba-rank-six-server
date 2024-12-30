import mongoose from 'mongoose';


const playersSchema = new mongoose.Schema(
    {
        PLAYER_NAME: { type: String, required: true },
        PLAYER_ID: { type: String, required: true, unique: true },
        ROSTERSTATUS: { type: Number, required: true },
        START_YEAR: { type: Number, required: true },
        END_YEAR: { type: Number, required: true },
        SEASONS_EXPOSED: { type: Number, required: true },
        SEASONS_PLAYED: { type: Number, required: true },
        GP: { type: Number, required: true },
        GS: { type: Number, required: true },
        PPG: { type: Number, required: true },
        APG: { type: Number, required: true },
        RPG: { type: Number, required: true },
        MPG: { type: Number, required: true },
        GAMES_PER_SEASON: { type: Number, required: true },
        CODE: { type: String, required: true }
    },
    { strict: true, collection: 'rank-six-player-collection' },
);


const Players = mongoose.model('Players', playersSchema);

export default Players;
