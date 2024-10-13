import express from 'express';
import Session from '../models/session_schema.js';
import User from '../models/user_schema.js';
import { generateScoresArray, shuffleArray } from '../utils/game_logic.js';
import { MAX_ATTEMPTS, CORRECT_GUESSES } from '../utils/globals.js';
import { handleCreateSessionController, handleFetchSessionController } from '../controllers/session_controller.js';

const router = express.Router();

router.get('/retrieve/:user_id/:session_id', handleFetchSessionController);
router.post('/create', handleCreateSessionController);


router.put('/evaluate', async (req, res) => {
    const { user_id, session_id, guesses, attempts } = req.body;

    // console.log(user_id, session_id, guesses, attempts);
    try {
        const session = await Session.findOne({ user_id, session_id });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const solution_map = session.solution_map;

        const scores_array = generateScoresArray(guesses, solution_map);

        // if every value is 0, then user wins. Set session_status to 1, return correct solution, update user stats
        if (scores_array.every((score) => score === 0)) {
            const result = {
                scores: scores_array,
                session_status: 1,
                attempts: attempts,
            };

            const user = await User.findOne({ user_id: user_id });

            const newCurrentStreak = user.current_streak + 1;

            const updateResult = await User.updateOne(
                {
                    user_id: user_id,
                },
                {
                    $inc: {
                        games_played: 1,
                        wins: 1,
                        [`attempts_distribution.${attempts - 1}`]: 1,
                    },
                    $set: {
                        current_streak: newCurrentStreak,
                    },
                    $max: {
                        longest_streak: newCurrentStreak,
                    },
                },
            );

            const sessionUpdate = await Session.updateOne(
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

            if (updateResult.acknowledged && sessionUpdate.acknowledged) {
                console.log('Update successful:', updateResult);
            }

            // console.log(result);

            res.json(result);
        } else {
            // user lost. Set session status to -1, return correct solution, update user stats
            if (attempts === MAX_ATTEMPTS) {
                // curr streak set to 0
                // games played + 1
                // TODO: Add session updating logic too
                // const user = await User.findOne({ user_id: user_id });

                const sessionUpdate = await Session.updateOne(
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

                const updateResult = await User.updateOne(
                    {
                        user_id: user_id,
                    },
                    {
                        $inc: {
                            games_played: 1,
                        },
                        $set: {
                            current_streak: 0,
                        },
                    },
                );

                if (updateResult.acknowledged && sessionUpdate.acknowledged) {
                    console.log('Update successful:', updateResult);
                }

                const result = {
                    session_status: -1,
                    attempts: attempts,
                    scores: scores_array,
                };

                res.json(result);
            } else {
                const result = {
                    session_status: 0,
                    attempts: attempts,
                    scores: scores_array,
                };

                res.json(result);
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving session', error });
    }
});

export default router;
