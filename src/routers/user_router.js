import express from 'express';
import { handleCreateUserController, handleFetchStatsController } from '../controllers/user_controller.js';

const router = express.Router();

router.post('/create', handleCreateUserController);
router.get('/stats/:user_id', handleFetchStatsController);

export default router;
