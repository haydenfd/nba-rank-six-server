# Rank 6 Backend Service

-   Hosted on AWS EC2 (t2.micro Ubuntu) w/ PM2.

## Evaluating attempt

-   Get solution map
-   Compute scores
    -   if scores results in win -> update session, send back solution, session_status, attempts, update user stats
    -   same thing is loss.
    -   else, don't do much; just send back session_status, attempts


NOTES => 

players_schema

import mongoose from 'mongoose';

const playersSchema = new mongoose.Schema(
    {
        PLAYER_NAME: { type: String, required: true },
        PLAYER_ID: { type: Number, required: true, unique: true },
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
    { strict: true, collection: 'rank-six-player-collection' }
);

const Players = mongoose.model('Players', playersSchema);

export default Players;


session_schema

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
                    PLAYER_ID: { type: Number, required: true, unique: true },
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
                }
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


session_service 

import Session from '../models/session_schema.js';
import { generateSessionId } from '../utils/id_generator.js';
import { fetchPlayersService } from './player_service.js';

const createSessionService = async (user_id) => {
    const newSessionId = generateSessionId();

    try {
        
        const { players, sorted_players, solution_map } = await fetchPlayersService();

        const newSessionObject = {
            user_id: user_id,
            session_id: newSessionId,
            session_status: 0,
            attempts: 0,
            players: sorted_players,
            solution_map: solution_map,
        };

        const newSession = new Session(newSessionObject);

        await newSession.save();

        const strippedPlayers = players.map((player) => ({
            PLAYER_NAME: player.PLAYER_NAME,
            PLAYER_ID: player.PLAYER_ID,
            CODE: player.CODE,
        }));

        return { newSessionId, strippedPlayers };
    } catch (e) {
        return false;
    }
};

const fetchSessionService = async (user_id, session_id) => {
    try {
        const session = await Session.findOne({ user_id, session_id });

        if (!session) {
            return null;
        }

        return session;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const updateWonSessionService = async (user_id, session_id, attempts) => {
    try {
        const updateStatus = await Session.updateOne(
            {
                user_id: user_id,
                session_id: session_id,
            },
            {
                $set: {
                    session_status: 1,
                    attempts: attempts,
                },
            },
        );

        return updateStatus.acknowledged;
    } catch (error) {
        return false;
    }
};

const updateLostSessionService = async (user_id, session_id, attempts = 3) => {
    try {
        const updateStatus = await Session.updateOne(
            {
                user_id: user_id,
                session_id: session_id,
            },
            {
                $set: {
                    session_status: -1,
                    attempts: attempts,
                },
            },
        );

        return updateStatus.acknowledged;
    } catch (error) {
        return false;
    }
};

export { createSessionService, fetchSessionService, updateWonSessionService, updateLostSessionService };

player_service

import Players from "../models/players_schema.js";
import { CORRECT_GUESSES } from "../utils/globals.js";
import { shuffleArray, sortPlayersByDescPPG, createSolutionMap } from "../utils/player_utils.js";

async function fetchPlayersService() {
    try {
        let players = await Players.aggregate([{ $sample: { size: CORRECT_GUESSES } }, { $project: { _id: 0, __v: 0 } }]);

        const sorted_players = sortPlayersByDescPPG(players);
        const solution_map = createSolutionMap(sorted_players);
        
        console.log(players)
        
        players = shuffleArray(players);
        const result = {
            players: players,
            sorted_players: sorted_players,
            solution_map: solution_map,
        }

        return result;
        
    } catch (error) {
        console.error('Error fetching random players:', error);
        return null;
    }
}

export {
    fetchPlayersService,
};