import express from "express";
import { login } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.get("/test", requireAuth, (req, res) => {
    res.json({
        message: "Authentication successful",
        user: req.user
    });
});

export default router;