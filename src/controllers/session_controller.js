import { fetchSessionService, createSessionService } from "../services/session_service.js";

const handleFetchSessionController = async (req, res) => {

    const user_id = req.params.user_id;
    const session_id = req.params.session_id;

    try {

        const session = await fetchSessionService(user_id, session_id);

        if (session) {
            res.status(200).json(session);

        } else {
            res.status(404).send("Session not found");
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

    res.status(500).json({ message: 'Error creating session' });
}

export {
    handleFetchSessionController,
    handleCreateSessionController,
};