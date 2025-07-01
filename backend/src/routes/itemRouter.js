import express from "express";
import { getItems, equipItem, craftItem, destroyItem, sellItem, unsellItem } from "../controllers/itemController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getItems);
router.post("/equip", authMiddleware, equipItem);
router.post("/craft", authMiddleware, craftItem);
router.post("/:id/destroy", authMiddleware, destroyItem);
router.post("/:id/sell", authMiddleware, sellItem);
router.post("/:id/unsell", authMiddleware, unsellItem);

export default router;


