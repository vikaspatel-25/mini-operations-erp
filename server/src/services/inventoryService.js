import pool from "../config/db.js";

export async function getInventory() {
    const result = await pool.query(`
        SELECT
            i.id,
            it.name AS item,
            c.name AS category,
            l.name AS location,
            b.batch_number AS batch,
            i.physical_quantity,
            i.reserved_quantity,
            (i.physical_quantity - i.reserved_quantity) AS available_quantity
        FROM inventory i
        JOIN items it
            ON i.item_id = it.id
        JOIN categories c
            ON it.category_id = c.id
        JOIN locations l
            ON i.location_id = l.id
        JOIN batches b
            ON i.batch_id = b.id
        ORDER BY i.id;
    `);

    return result.rows;
}

export async function adjustInventory({
    inventoryId,
    quantity,
    transactionId,
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
            WHERE id = $1
            FOR UPDATE
            `,
            [inventoryId]
        );

        if (inventoryResult.rows.length === 0) {
            throw new Error("Inventory not found");
        }

        const inventory = inventoryResult.rows[0];

        const newPhysicalQuantity =
            inventory.physical_quantity + quantity;

        if (newPhysicalQuantity < 0) {
            throw new Error("Insufficient physical stock");
        }

        if (newPhysicalQuantity < inventory.reserved_quantity) {
            throw new Error(
                "Physical quantity cannot be less than reserved quantity"
            );
        }

        await client.query(
            `
            UPDATE inventory
            SET
                physical_quantity = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            `,
            [newPhysicalQuantity, inventoryId]
        );

        await client.query(
            `
            INSERT INTO inventory_transactions
                (transaction_id, inventory_id, quantity, created_by)
            VALUES
                ($1, $2, $3, $4)
            `,
            [
                transactionId,
                inventoryId,
                quantity,
                userId
            ]
        );

        await client.query("COMMIT");

        return {
            inventoryId,
            previousQuantity: inventory.physical_quantity,
            newQuantity: newPhysicalQuantity,
            adjustment: quantity,
            transactionId
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}