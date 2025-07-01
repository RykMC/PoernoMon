import express from 'express';
import { getPoernomon, skillEigenschaft } from '../controllers/poernomonController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
// Route schützen + prüfen
router.get('/', authMiddleware, getPoernomon);
router.post('/skill', authMiddleware, skillEigenschaft);

export default router;
