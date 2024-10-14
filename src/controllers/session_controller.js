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
        const session = await fetchSessionService(user_id, session_id);

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
        };

        const result_lost = {
            session_status: -1,
            scores: scores_array,
            attempts: attempts,
        };

        const result_continue = {
            session_status: 0,
            scores: scores_array,
            attempts: attempts,
        };

        if (score === CORRECT_GUESSES) {
            const updateSessionStatus = await updateWonSessionService(user_id, session_id, attempts);
            const updateUserStatus = await updateUserStatsWonSessionService(user_id, attempts);
            result_won.update_status_user = updateUserStatus;
            result_won.update_status_session = updateSessionStatus;
            return res.status(200).json(result_won);
        } else {
            if (attempts === MAX_ATTEMPTS) {
                const updateSessionStatus = await updateLostSessionService(user_id, session_id, attempts);
                const updateUserStatus = await updateUserStatsLostSessionService(user_id);

                result_lost.update_status_user = updateUserStatus;
                result_lost.update_status_session = updateSessionStatus;
                return res.status(200).json(result_lost);
            } else {
                return res.status(200).json(result_continue);
            }
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export { handleFetchSessionController, handleCreateSessionController, handleSessionEvaluationController };

// router.put('/evaluate', async (req, res) => {
//     const { user_id, session_id, guesses, attempts } = req.body;

//     try {
//         const session = await Session.findOne({ user_id, session_id });

//         if (!session) {
//             return res.status(404).json({ message: 'Session not found' });
//         }

//         const solution_map = session.solution_map;

//         const scores_array = generateScoresArray(guesses, solution_map);

//         // if every value is 0, then user wins. Set session_status to 1, return correct solution, update user stats
//         if (scores_array.every((score) => score === 0)) {
//             const result = {
//                 scores: scores_array,
//                 session_status: 1,
//                 attempts: attempts,
//             };

//             const user = await User.findOne({ user_id: user_id });

//             const newCurrentStreak = user.current_streak + 1;

//             const updateResult = await User.updateOne(
//                 {
//                     user_id: user_id,
//                 },
//                 {
//                     $inc: {
//                         games_played: 1,
//                         wins: 1,
//                         [`attempts_distribution.${attempts - 1}`]: 1,
//                     },
//                     $set: {
//                         current_streak: newCurrentStreak,
//                     },
//                     $max: {
//                         longest_streak: newCurrentStreak,
//                     },
//                 },
//             );

//             const sessionUpdate = await Session.updateOne(
//                 {
//                     user_id: user_id,
//                     session_id: session_id,
//                 },
//                 {
//                     $set: {
//                         session_status: 1,
//                         attempts: attempts,
//                     },
//                 },
//             );

//             if (updateResult.acknowledged && sessionUpdate.acknowledged) {
//                 console.log('Update successful:', updateResult);
//             }

//             // console.log(result);

//             res.json(result);
//         } else {
//             // user lost. Set session status to -1, return correct solution, update user stats
//             if (attempts === MAX_ATTEMPTS) {
//                 // curr streak set to 0
//                 // games played + 1
//                 // TODO: Add session updating logic too
//                 // const user = await User.findOne({ user_id: user_id });

//                 const sessionUpdate = await Session.updateOne(
//                     {
//                         user_id: user_id,
//                         session_id: session_id,
//                     },
//                     {
//                         $set: {
//                             session_status: -1,
//                             attempts: attempts,
//                         },
//                     },
//                 );

//                 const updateResult = await User.updateOne(
//                     {
//                         user_id: user_id,
//                     },
//                     {
//                         $inc: {
//                             games_played: 1,
//                         },
//                         $set: {
//                             current_streak: 0,
//                         },
//                     },
//                 );

//                 if (updateResult.acknowledged && sessionUpdate.acknowledged) {
//                     console.log('Update successful:', updateResult);
//                 }

//                 const result = {
//                     session_status: -1,
//                     attempts: attempts,
//                     scores: scores_array,
//                 };

//                 res.json(result);
//             } else {
//                 const result = {
//                     session_status: 0,
//                     attempts: attempts,
//                     scores: scores_array,
//                 };

//                 res.json(result);
//             }
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving session', error });
//     }
// });

// const handleActiveSessionController = async (req, res) => {

//     const user_id = req.params.user_id;

//     const result = await Session.findOne(
//         {
//             user_id: user_id,
//             session_status: 0,
//         }
//     )

//     if (!result) {
//         return res.status(200).json({"Status": "404"})
//     } else {
//         return res.status(200).json(result);
//     }
// }
