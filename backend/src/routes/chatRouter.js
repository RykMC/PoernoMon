import express from "express";
import { chatPoernomon } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, chatPoernomon);

export default router;
