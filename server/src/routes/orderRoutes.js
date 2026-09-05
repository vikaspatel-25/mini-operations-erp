import express from "express";

import {
    getOrdersRequest,
    createOrder
} from "../controllers/orderController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    requireAuth,
    getOrdersRequest
);

router.post(
    "/",
    requireAuth,
    requireRole("ADMIN", "SALES"),
    createOrder
);

export default router;