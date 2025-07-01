import express from "express";
import { getShopItems, buyShopItem } from "../controllers/shopController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getShopItems);
router.post("/:id/buy", authMiddleware, buyShopItem);


export default router;
