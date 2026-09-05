import express from "express";
import { createOrder } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    requireAuth,
    requireRole("ADMIN","SALES"),
    createOrder
);

export default router;