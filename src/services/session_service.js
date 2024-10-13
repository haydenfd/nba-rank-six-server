import Session from '../models/session_schema.js';
import { shuffleArray } from '../utils/game_logic.js';
import { generateSessionId } from '../utils/id_generator.js';
import Players from '../models/players_schema.js';

async function fetchRandomPlayers() {
    try {
        const randomPlayers = await Players.aggregate([{ $sample: { size: 5 } }, { $project: { _id: 0, __v: 0 } }]);
        return randomPlayers;
    } catch (error) {
        console.error('Error fetching random players:', error);
        throw error;
    }
}

function createSolutionMapping(players) {
    players.sort((a, b) => b.PPG - a.PPG);
    const map = {};
    players.forEach((player, idx) => {
        map[player.PLAYER_ID] = idx;
    });

    return map;
}

const createSessionService = async (user_id) => {
    const newSessionId = generateSessionId();

    try {
        let randomPlayers = await fetchRandomPlayers();
        // console.log('Random players:\n');
        // console.log(randomPlayers);

        const solutionMap = createSolutionMapping(randomPlayers);
        // console.log('Solution map:\n');
        // console.log(solutionMap);

        randomPlayers = shuffleArray(randomPlayers);

        const newSessionObject = {
            user_id: user_id,
            session_id: newSessionId,
            session_status: 0,
            attempts: 0,
            players: randomPlayers,
            solution_map: solutionMap,
        };

        // console.log('This is new session:\n');
        // console.log(newSessionObject);
        const newSession = new Session(newSessionObject);

        // console.log(newSession);
        await newSession.save();

        const strippedPlayers = randomPlayers.map((player) => ({
            PLAYER_NAME: player.PLAYER_NAME,
            PLAYER_ID: player.PLAYER_ID,
        }));

        // console.log('stripped players:\n');
        // console.log(strippedPlayers);

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

        console.log('Session:\n');
        console.log(session);
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

        if (updateStatus.acknowledged) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

const updateLostSessionService = async (user_id, session_id, attempts = 3) => {

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

        if (updateStatus.acknowledged) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

export { createSessionService, fetchSessionService, updateWonSessionService, updateLostSessionService};
