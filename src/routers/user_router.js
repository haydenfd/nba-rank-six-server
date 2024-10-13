import express from 'express';
import User from '../models/user_schema.js';
import Session from '../models/session_schema.js';
import Players from '../models/players_schema.js';
import { shuffleArray } from '../utils/game_logic.js';
import { generateUserId, generateSessionId } from '../utils/id_generator.js';
import { MAX_ATTEMPTS, CORRECT_GUESSES } from '../utils/globals.js';

const router = express.Router();

// Utility funcs
async function fetchRandomPlayers() {
    try {
        const randomPlayers = await Players.aggregate([
            { $sample: { size: 5 } },
            { $project: { _id: 0, __v: 0 } },
        ]);
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


async function checkIfUserExists(user_id) {
    const user = await User.findOne({ user_id });
    if (user) {
        return true;
    } else {
        return false;
    }
}

const initiateSession = async (user_id) => {
    const newSessionId = generateSessionId();

    try {
        let randomPlayers = await fetchRandomPlayers();
        const solutionMap = createSolutionMapping(randomPlayers);

        randomPlayers = shuffleArray(randomPlayers);

        const newSessionObject = {
            user_id: user_id,
            session_id: newSessionId,
            session_status: 0,
            attempts: 0,
            players: randomPlayers,
            solution_map: solutionMap,
        };

        // console.log(newSessionObject);
        const newSession = new Session(newSessionObject);

        // console.log(newSession);
        await newSession.save();

        const strippedPlayers = randomPlayers.map((player) => ({
            PLAYER_NAME: player.PLAYER_NAME,
            PLAYER_ID: player.PLAYER_ID,
        }));

        return { newSessionId, strippedPlayers };
    } catch (e) {
        return false;
    }
};

async function addUser(user_id) {
    try {
        const newUser = new User({
            user_id: user_id,
        });

        await newUser.save();

        return true;
    } catch (error) {
        return false;
    }
}

async function fetchUser(user_id) {
    try {
        const user = await User.findOne({ user_id: user_id });
        return { user };
    } catch (error) {
        console.error('Error fetching user:', error);
        return false;
    }
}

router.post('/create', async (req, res) => {
    const newId = generateUserId();
    const doesIdExist = await checkIfUserExists(newId);

    if (!doesIdExist) {
        const userAdded = await addUser(newId);
        if (userAdded) {
            const { newSessionId, strippedPlayers } =
                await initiateSession(newId);
            if (newSessionId) {
                return res.status(201).json({
                    user_id: newId,
                    session_id: newSessionId,
                    players: strippedPlayers,
                });
            }

            return res
                .status(500)
                .json({ message: 'Could not initiate session' });
        } else {
            return res.status(500).json({ message: 'Error adding user' });
        }
    } else {
        return res.status(409).json({ message: 'User already exists' });
    }
});

router.get('/stats/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { user } = await fetchUser(user_id); // Destructure the user object from fetchUser

    if (user) {
        return res.status(200).json({
            games_played: user.games_played,
            wins: user.wins,
            longest_streak: user.longest_streak,
            current_streak: user.current_streak,
            attempts_distribution: user.attempts_distribution,
        });
    }

    return res.status(500).json({ message: 'Error' });
});
export default router;
