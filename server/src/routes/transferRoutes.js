import express from "express";
import {
    createTransferRequest,
    dispatchTransferRequest,
    receiveTransferRequest
} from "../controllers/transferController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    requireAuth,
    createTransferRequest
);

router.post(
    "/:id/dispatch",
    requireAuth,
    dispatchTransferRequest
);

router.post(
    "/:id/receive",
    requireAuth,
    receiveTransferRequest
);

export default router;