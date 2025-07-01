import express from "express";
import { getUngeleseneNachrichten, getAlleNachrichten, getNachrichtById, deleteNachricht } from "../controllers/nachrichtenController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/ungelesen", authMiddleware, getUngeleseneNachrichten);
router.get("/", authMiddleware, getAlleNachrichten);
router.get("/:id", authMiddleware, getNachrichtById);
router.delete("/:id", authMiddleware, deleteNachricht);

export default router;
