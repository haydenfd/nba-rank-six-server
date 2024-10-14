import express from 'express';
import { handleCreateUserController, handleFetchUserStatsController } from '../controllers/user_controller.js';

const router = express.Router();

router.post('/create', handleCreateUserController);
router.get('/stats/:user_id', handleFetchUserStatsController);

export default router;
