import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/login.jsx";
import Inventory from "@/pages/Inventory.jsx";
import WorkOrders from "@/pages/WorkOrders.jsx";
import Transfers from "@/pages/Transfers.jsx";
import Orders from "@/pages/Orders.jsx";

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/inventory"
                element={<Inventory />}
            />

                    <Route
                path="/work-orders"
                element={<WorkOrders />}
            />

            <Route
                path="/transfers"
                element={<Transfers/>}
            />

            <Route
                path="/orders"
                element={<Orders/>}
            />
        </Routes>
    );
}

export default AppRoutes;