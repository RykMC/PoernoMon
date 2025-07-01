import express from "express";
import { getSpielerStats, getRanking } from "../controllers/statistikController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authMiddleware, getSpielerStats);

router.get("/ranking/:metric", authMiddleware, getRanking);

export default router;



