import pool from "../config/db.js";

export async function createCustomerOrder({
    orderNumber,
    itemId,
    locationId,
    quantity,
    userId
}) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const inventoryResult = await client.query(
            `
            SELECT
                id,
                physical_quantity,
                reserved_quantity
            FROM inventory
            WHERE item_id = $1
              AND location_id = $2
            FOR UPDATE
            `,
            [itemId, locationId]
        );

        if (inventoryResult.rows.length === 0) {
            throw new Error("Inventory not found");
        }

        const inventory = inventoryResult.rows[0];

        const availableQuantity =
            inventory.physical_quantity -
            inventory.reserved_quantity;

        if (quantity > availableQuantity) {
            throw new Error("Insufficient available stock");
        }

        await client.query(
            `
            UPDATE inventory
            SET
                reserved_quantity = reserved_quantity + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            `,
            [quantity, inventory.id]
        );

        const orderResult = await client.query(
            `
            INSERT INTO customer_orders (
                order_number,
                created_by
            )
            VALUES ($1, $2)
            RETURNING id, order_number, created_by, created_at
            `,
            [orderNumber, userId]
        );

        const order = orderResult.rows[0];

        await client.query(
            `
            INSERT INTO customer_order_items (
                order_id,
                item_id,
                quantity
            )
            VALUES ($1, $2, $3)
            `,
            [
                order.id,
                itemId,
                quantity
            ]
        );

        await client.query("COMMIT");

        return {
            ...order,
            itemId,
            quantity,
            inventoryId: inventory.id
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}