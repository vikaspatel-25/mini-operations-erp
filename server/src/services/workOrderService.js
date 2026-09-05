import pool from "../config/db.js";

export async function createWorkOrder({
    workOrderNumber,
    locationId,
    itemId,
    requiredQuantity,
    assignedUserId
}) {
    const result = await pool.query(
        `
        SELECT
            COALESCE(
                SUM(
                    physical_quantity - reserved_quantity
                ),
                0
            ) AS available_quantity
        FROM inventory
        WHERE location_id = $1
          AND item_id = $2
        `,
        [locationId, itemId]
    );

    const availableQuantity =
        Number(result.rows[0].available_quantity);

    const shortage = Math.max(
        requiredQuantity - availableQuantity,
        0
    );

    const workOrderResult = await pool.query(
        `
        INSERT INTO work_orders (
            work_order_number,
            location_id,
            item_id,
            required_quantity,
            assigned_user_id,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'ASSIGNED'
        )
        RETURNING *
        `,
        [
            workOrderNumber,
            locationId,
            itemId,
            requiredQuantity,
            assignedUserId
        ]
    );

    return {
        workOrder: workOrderResult.rows[0],
        availableQuantity,
        shortage
    };
}