import express from 'express';
import { register, login, getMe, setUsername, getRandomPoernomon, getRandomName, getRandomBotEmail  } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/random', getRandomPoernomon);
router.get('/random-name', authMiddleware, getRandomName);
router.get('/me', authMiddleware, getMe);
router.post('/set-username', authMiddleware, setUsername);

router.get('/botEmail', getRandomBotEmail);

export default router;
