import { getInventory, adjustInventory } from "../services/inventoryService.js";

export async function getInventoryList(req, res) {
  try {
    const inventory = await getInventory();

    return res.status(200).json({
      inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function adjustInventoryStock(req, res) {
  try {
    const { inventoryId, quantity, transactionId } = req.body;

    if (inventoryId === undefined || quantity === undefined || !transactionId) {
      return res.status(400).json({
        message: "inventoryId, quantity and transactionId are required",
      });
    }

    if (!Number.isInteger(inventoryId)) {
      return res.status(400).json({
        message: "inventoryId must be an integer",
      });
    }

    if (!Number.isInteger(quantity) || quantity === 0) {
      return res.status(400).json({
        message: "quantity must be a non-zero integer",
      });
    }

    const result = await adjustInventory({
      inventoryId,
      quantity,
      transactionId,
      userId: req.user.userId,
    });

    return res.status(200).json({
      message: "Inventory adjusted successfully",
      result,
    });
  } catch (error) {
    console.error("Adjust inventory error:", error);

    if (
      error.message === "Inventory not found" ||
      error.message === "Insufficient physical stock" ||
      error.message ===
        "Physical quantity cannot be less than reserved quantity"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Transaction ID already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
