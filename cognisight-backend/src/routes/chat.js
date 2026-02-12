import express from 'express';
import { sendMessage, getHistory, clearHistory } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', verifyToken, sendMessage);
router.get('/history', verifyToken, getHistory);
router.delete('/history', verifyToken, clearHistory);

export default router;
