import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ERP API is running"
    });
});

const startServer = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server started at ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

await startServer();