import express from "express";
import { getInventoryList, adjustInventoryStock } from "../controllers/inventoryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getInventoryList);

router.post(
    "/adjust",
    requireAuth,
    adjustInventoryStock
);

export default router;