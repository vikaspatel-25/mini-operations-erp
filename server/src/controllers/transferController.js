import { createTransfer,dispatchTransfer,receiveTransfer,getTransferData
 } from "../services/transferService.js";



export async function getTransfersRequest(req, res) {
    try {
        const data = await getTransferData();

        return res.status(200).json(data);

    } catch (error) {
        console.error("Get transfers error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
 

export async function createTransferRequest(req, res) {
    try {
        const {
            transferNumber,
            sourceLocationId,
            destinationLocationId,
            itemId,
            batchId,
            quantity
        } = req.body;

        if (
            !transferNumber ||
            sourceLocationId === undefined ||
            destinationLocationId === undefined ||
            itemId === undefined ||
            batchId === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                message: "All transfer fields are required"
            });
        }

        if (
            !Number.isInteger(sourceLocationId) ||
            !Number.isInteger(destinationLocationId) ||
            !Number.isInteger(itemId) ||
            !Number.isInteger(batchId) ||
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

        if (sourceLocationId === destinationLocationId) {
            return res.status(400).json({
                message: "Source and destination locations must be different"
            });
        }

        const transfer = await createTransfer({
            transferNumber,
            sourceLocationId,
            destinationLocationId,
            itemId,
            batchId,
            quantity
        });

        return res.status(201).json({
            message: "Transfer request created successfully",
            transfer
        });

    } catch (error) {
        console.error("Create transfer error:", error);

        if (
            error.message === "Source inventory not found" ||
            error.message === "Insufficient available stock"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Transfer number already exists"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function dispatchTransferRequest(req, res) {
    try {
        const transferId = Number(req.params.id);

        if (!Number.isInteger(transferId)) {
            return res.status(400).json({
                message: "Invalid transfer ID"
            });
        }

        const transfer = await dispatchTransfer(
            transferId,
            req.user.userId
        );

        return res.status(200).json({
            message: "Transfer dispatched successfully",
            transfer
        });

    } catch (error) {
        console.error("Dispatch transfer error:", error);

        if (
            error.message === "Transfer not found" ||
            error.message === "Source inventory not found" ||
            error.message === "Insufficient available stock" ||
            error.message ===
                "Only requested transfers can be dispatched"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Transfer has already been dispatched"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function receiveTransferRequest(req, res) {
    try {
        const transferId = Number(req.params.id);

        if (!Number.isInteger(transferId)) {
            return res.status(400).json({
                message: "Invalid transfer ID"
            });
        }

        const transfer = await receiveTransfer(
            transferId,
            req.user.userId
        );

        return res.status(200).json({
            message: "Transfer received successfully",
            transfer
        });

    } catch (error) {
        console.error("Receive transfer error:", error);

        if (
            error.message === "Transfer not found" ||
            error.message === "Destination inventory not found" ||
            error.message ===
                "Only dispatched transfers can be received"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Transfer receipt already exists"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}