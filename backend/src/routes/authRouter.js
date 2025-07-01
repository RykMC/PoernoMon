import express from 'express';
import { register, login, getMe, setUsername  } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/set-username', authMiddleware, setUsername);

export default router;
