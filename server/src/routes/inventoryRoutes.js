import express from "express";
import {
  getInventoryList,
  adjustInventoryStock,
} from "../controllers/inventoryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", requireAuth, getInventoryList);

router.post(
  "/adjust",
  requireAuth,
  requireRole("ADMIN","OPERATIONS"),
  adjustInventoryStock,
);

export default router;
