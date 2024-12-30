import { fetchSessionService, createSessionService, updateWonSessionService, updateLostSessionService, fetchSessionForEvaluationService } from '../services/session_service.js';
import { CORRECT_GUESSES, MAX_ATTEMPTS } from '../utils/globals.js';
import { generateScoresArray } from '../utils/game_logic.js';
import { updateUserStatsWonSessionService, updateUserStatsLostSessionService } from '../services/user_service.js';

const handleFetchSessionController = async (req, res) => {
    const user_id = req.params.user_id;
    const session_id = req.params.session_id;

    try {
        const session = await fetchSessionService(user_id, session_id);

        if (session) {
            return res.status(200).json(session);
        } else {
            return res.status(404).send('Session not found');
        }
    } catch (error) {
        return res.status(500).send('Error fetching session');
    }
};

const handleCreateSessionController = async (req, res) => {
    const userId = req.body.user_id;
    console.log("Invoked create session")
    const { newSessionId, strippedPlayers } = await createSessionService(userId);

    if (newSessionId) {
        return res.status(201).json({
            user_id: userId,
            session_id: newSessionId,
            players: strippedPlayers,
        });
    }

    return res.status(500).send('Error creating session');
};

const handleSessionEvaluationController = async (req, res) => {
    const { user_id, session_id, guesses, attempts } = req.body;

    try {
        const session = await fetchSessionForEvaluationService(user_id, session_id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const solution_map = session.solution_map;
        const scores_array = generateScoresArray(guesses, solution_map);
        const score = scores_array.filter((s) => s === 0).length;

        const result_won = {
            session_status: 1,
            scores: scores_array,
            attempts: attempts,
            solution: session.players,
        };

        const result_lost = {
            session_status: -1,
            scores: scores_array,
            attempts: attempts,
            solution: session.players,
        };

        const result_continue = {
            session_status: 0,
            scores: scores_array,
            attempts: attempts,
        };

        if (score === CORRECT_GUESSES) {
            const updateSessionStatus = await updateWonSessionService(user_id, session_id, attempts);
            const updateUserStatus = await updateUserStatsWonSessionService(user_id, attempts);

            if (updateSessionStatus && updateUserStatus) {
                return res.status(200).json(result_won);
            } else {
                return res.status(500).send("Could not save session/user stats")
            }
        } else {
            if (attempts === MAX_ATTEMPTS) {
                const updateSessionStatus = await updateLostSessionService(user_id, session_id, attempts);
                const updateUserStatus = await updateUserStatsLostSessionService(user_id);

                if (updateSessionStatus && updateUserStatus) {
                    return res.status(200).json(result_lost);
                } else {
                    return res.status(500).send("Could not save session/user stats")
                }
            } else {
                return res.status(200).json(result_continue);
            }
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export { handleFetchSessionController, handleCreateSessionController, handleSessionEvaluationController };

