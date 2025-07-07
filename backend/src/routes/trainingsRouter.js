import express from 'express';
import { getTraining, startTraining, interruptTraining} from "../controllers/trainingsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get('/', authMiddleware, getTraining);
router.post('/start', authMiddleware, startTraining);
router.post('/interrupt', authMiddleware, interruptTraining);

export default router;


