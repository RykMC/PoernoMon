// src/routes/designRoutes.js
import express from "express";
import { getUserDesigns, setDesign } from "../controllers/designController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/my-designs", authMiddleware, getUserDesigns);
router.post("/select", authMiddleware, setDesign);

export default router;
