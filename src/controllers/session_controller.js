import { fetchSessionService, createSessionService, updateWonSessionService, updateLostSessionService } from '../services/session_service.js';
import { CORRECT_GUESSES, MAX_ATTEMPTS } from '../utils/globals.js';
import { generateScoresArray } from '../utils/game_logic.js';
import { updateUserStatsWonSessionService, updateUserStatsLostSessionService } from '../services/user_service.js';

const handleFetchSessionController = async (req, res) => {
    const user_id = req.params.user_id;
    const session_id = req.params.session_id;

    try {
        const session = await fetchSessionService(user_id, session_id);

        if (session) {
            res.status(200).json(session);
        } else {
            res.status(404).send('Session not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching session');
    }
};

const handleCreateSessionController = async (req, res) => {
    const userId = req.body.user_id;
    const { newSessionId, strippedPlayers } = await createSessionService(userId);

    if (newSessionId) {
        res.status(201).json({
            user_id: userId,
            session_id: newSessionId,
            players: strippedPlayers,
        });
    }

    res.status(500).send('Error creating session');
};

const handleSessionEvaluationController = async (req, res) => {
    const { user_id, session_id, guesses, attempts } = req.body;

    try {
        // (1) Fetch the session
        const session = await fetchSessionService(user_id, session_id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // (2) Compute scores from solution map
        const solution_map = session.solution_map;
        const scores_array = generateScoresArray(guesses, solution_map);
        const score = scores_array.filter(s => s === 0).length;

        // (3) Check if user won
        if (score === CORRECT_GUESSES) {
            const updateSessionUserWon = await updateWonSessionService(user_id, session_id, attempts);
            const updateUserStatsSessionWon = await updateUserStatsWonSessionService(user_id, attempts);

            if (updateSessionUserWon && updateUserStatsSessionWon) {
                return res.status(200).json({
                    session_status: 1,
                    attempts: attempts,
                    scores: scores_array,
                });
            }

            return res.status(500).send("Could not update user win");
        }

        // (4) Check if user lost (attempts exhausted)
         else if (attempts === MAX_ATTEMPTS) {
            const updateSessionUserLost = await updateLostSessionService(user_id, session_id, attempts);
            const updateUserStatsSessionLost = await updateUserStatsLostSessionService(user_id, attempts);

            if (updateSessionUserLost && updateUserStatsSessionLost) {
                return res.status(200).json({
                    session_status: -1,
                    attempts: attempts,
                    scores: scores_array,
                });
            }

            return res.status(500).send("Could not update user loss");
        }

        // (5) Ongoing session (user neither won nor lost)
        else {
            return res.status(200).json({
            session_status: 0,
            attempts: attempts,
            scores: scores_array,
        });
        }

    } catch (error) {
        return res.status(500).send('Error evaluating attempt');
    }
};


export { handleFetchSessionController, handleCreateSessionController, handleSessionEvaluationController };
