// src/routes/designRoutes.js
import express from "express";
import { getUserDesigns, setDesign, getAlleErfolge, markErfolgGesehen } from "../controllers/designController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/my-designs", authMiddleware, getUserDesigns);
router.post("/select", authMiddleware, setDesign);

router.get("/alleErfolge", authMiddleware, getAlleErfolge);
router.post("/markGesehen", authMiddleware, markErfolgGesehen);

export default router;


