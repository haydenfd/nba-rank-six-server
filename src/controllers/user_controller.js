import { generateUserId } from '../utils/id_generator.js';
import * as UserServices from '../services/user_service.js';
import { createSessionService } from '../services/session_service.js';

const handleCreateUserController = async (req, res) => {
    const newId = generateUserId();
    const doesUserIdExist = await UserServices.checkIfUserIdExistsService(newId);

    if (!doesUserIdExist) {
        const wasUserAdded = await UserServices.addUserService(newId);
        if (wasUserAdded) {
            const { newSessionId, strippedPlayers } = await createSessionService(newId);

            if (newSessionId) {
                return res.status(201).json({
                    user_id: newId,
                    session_id: newSessionId,
                    players: strippedPlayers,
                });
            }

            return res.status(500).json({ message: 'Error creating session' });
        } else {
            return res.status(500).json({ message: 'Error adding user' });
        }
    } else {
        return res.status(409).json({ message: 'User already exists' });
    }
};

const handleFetchUserStatsController = async (req, res) => {
    try {
        const { user_id } = req.params;
        const userStats = await UserServices.fetchUserStatsService(user_id);

        if (userStats) {
            return res.status(200).json(userStats);
        }

        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching stats' });
    }
};

export { handleCreateUserController, handleFetchUserStatsController };
