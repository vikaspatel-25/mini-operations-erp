import express from "express";

import {
    getTransfersRequest,
    createTransferRequest,
    dispatchTransferRequest,
    receiveTransferRequest,
} from "../controllers/transferController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    requireAuth,
    getTransfersRequest
);

router.post(
    "/",
    requireAuth,
    requireRole("ADMIN", "OPERATIONS"),
    createTransferRequest
);

router.post(
    "/:id/dispatch",
    requireAuth,
    requireRole("ADMIN", "OPERATIONS"),
    dispatchTransferRequest
);

router.post(
    "/:id/receive",
    requireAuth,
    requireRole("ADMIN", "OPERATIONS"),
    receiveTransferRequest
);

export default router;