import { createCustomerOrder } from "../services/orderService.js";

export async function createOrder(req, res) {
    try {
        const {
            orderNumber,
            itemId,
            locationId,
            quantity
        } = req.body;

        if (
            !orderNumber ||
            itemId === undefined ||
            locationId === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                message: "All order fields are required"
            });
        }

        if (
            !Number.isInteger(itemId) ||
            !Number.isInteger(locationId) ||
            !Number.isInteger(quantity)
        ) {
            return res.status(400).json({
                message: "IDs and quantity must be integers"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const order = await createCustomerOrder({
            orderNumber,
            itemId,
            locationId,
            quantity,
            userId: req.user.userId
        });

        return res.status(201).json({
            message: "Customer order created successfully",
            order
        });

    } catch (error) {
        console.error("Create order error:", error);

        if (
            error.message === "Inventory not found" ||
            error.message === "Insufficient available stock"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Order number already exists"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}