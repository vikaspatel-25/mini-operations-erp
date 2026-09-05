import express from "express";

import {
  getWorkOrdersRequest,createWorkOrderRequest } from "../controllers/workOrderController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getWorkOrdersRequest);

router.post("/", requireAuth, requireRole("ADMIN"), createWorkOrderRequest);

export default router;
