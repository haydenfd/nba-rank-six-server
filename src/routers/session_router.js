import express from 'express';
import { handleCreateSessionController, handleFetchSessionController, handleSessionEvaluationController } from '../controllers/session_controller.js';

const router = express.Router();

router.get('/retrieve/:user_id/:session_id', handleFetchSessionController);
router.post('/create', handleCreateSessionController);
router.put('/evaluate', handleSessionEvaluationController);

export default router;
