import express from "express";
import { matchmaking, getKampfverlauf } from "../controllers/fightController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/matchmaking", authMiddleware, matchmaking);
router.get("/log/:kampfId", authMiddleware, getKampfverlauf);

export default router;
