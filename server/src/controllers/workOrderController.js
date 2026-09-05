import {
  getWorkOrderData,
  createWorkOrder,
} from "../services/workOrderService.js";

export async function getWorkOrdersRequest(req, res) {
  try {
    const data = await getWorkOrderData();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Get work orders error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function createWorkOrderRequest(req, res) {
  try {
    const {
      workOrderNumber,
      locationId,
      itemId,
      requiredQuantity,
      assignedUserId,
    } = req.body;

    if (
      !workOrderNumber ||
      locationId === undefined ||
      itemId === undefined ||
      requiredQuantity === undefined ||
      assignedUserId === undefined
    ) {
      return res.status(400).json({
        message: "All work order fields are required",
      });
    }

    if (
      !Number.isInteger(locationId) ||
      !Number.isInteger(itemId) ||
      !Number.isInteger(requiredQuantity) ||
      !Number.isInteger(assignedUserId)
    ) {
      return res.status(400).json({
        message: "IDs and required quantity must be integers",
      });
    }

    if (requiredQuantity <= 0) {
      return res.status(400).json({
        message: "Required quantity must be greater than 0",
      });
    }

    const result = await createWorkOrder({
      workOrderNumber,
      locationId,
      itemId,
      requiredQuantity,
      assignedUserId,
    });

    return res.status(201).json({
      message: "Work order created successfully",
      result,
    });
  } catch (error) {
    console.error("Create work order error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Work order number already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
