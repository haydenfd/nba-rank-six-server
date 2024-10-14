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

// async function fetchRandomPlayers() {
    //     try {
    //         const randomPlayers = await Players.aggregate([{ $sample: { size: 5 } }, { $project: { _id: 0, __v: 0 } }]);
    //         return randomPlayers;
    //     } catch (error) {
    //         console.error('Error fetching random players:', error);
    //         throw error;
    //     }
    // }
    
    // function createSolutionMapping(players) {
    //     const sorted_players = players.sort((a, b) => b.PPG - a.PPG);
    //     const map = {};
    //     sorted_players.forEach((player, idx) => {
    //         map[player.PLAYER_ID] = idx;
    //     });
    
    //     console.log("sorted\n");
    //     console.log(sorted_players);
    //     return {sorted_players, map};
    // }
    