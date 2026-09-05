import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login.jsx";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/dashboard"
                element={<h1>Dashboard</h1>}
            />
        </Routes>
    );
}

export default AppRoutes;