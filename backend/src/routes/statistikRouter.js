import express from "express";
import { getSpielerStats, getRanking, getKaempfeStatistik } from "../controllers/statistikController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authMiddleware, getSpielerStats);

router.get("/ranking/:metric", authMiddleware, getRanking);

router.get("/kaempfe", authMiddleware, getKaempfeStatistik);

export default router;





