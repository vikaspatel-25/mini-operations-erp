import pool from "../config/db.js";

export async function getTransferData() {
  const transfersResult = await pool.query(`
        SELECT
            st.id,
            st.transfer_number,
            sl.name AS source_location,
            dl.name AS destination_location,
            it.name AS item,
            b.batch_number AS batch,
            st.quantity,
            st.status
        FROM stock_transfers st
        JOIN locations sl
            ON st.source_location_id = sl.id
        JOIN locations dl
            ON st.destination_location_id = dl.id
        JOIN items it
            ON st.item_id = it.id
        JOIN batches b
            ON st.batch_id = b.id
        ORDER BY st.id DESC
    `);

  const locationsResult = await pool.query(`
        SELECT id, name
        FROM locations
        ORDER BY name
    `);

  const itemsResult = await pool.query(`
        SELECT
            it.id,
            it.name,
            c.name AS category
        FROM items it
        JOIN categories c
            ON it.category_id = c.id
        ORDER BY it.name
    `);

  const batchesResult = await pool.query(`
        SELECT
            id,
            batch_number,
            item_id
        FROM batches
        ORDER BY batch_number
    `);

  return {
    transfers: transfersResult.rows,
    locations: locationsResult.rows,
    items: itemsResult.rows,
    batches: batchesResult.rows,
  };
}

export async function createTransfer({
  transferNumber,
  sourceLocationId,
  destinationLocationId,
  itemId,
  batchId,
  quantity,
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
            WHERE location_id = $1
              AND item_id = $2
              AND batch_id = $3
            FOR UPDATE
            `,
      [sourceLocationId, itemId, batchId],
    );

    if (inventoryResult.rows.length === 0) {
      throw new Error("Source inventory not found");
    }

    const inventory = inventoryResult.rows[0];

    const availableQuantity =
      inventory.physical_quantity - inventory.reserved_quantity;

    if (quantity > availableQuantity) {
      throw new Error("Insufficient available stock");
    }

    const transferResult = await client.query(
      `
            INSERT INTO stock_transfers (
                transfer_number,
                source_location_id,
                destination_location_id,
                item_id,
                batch_id,
                quantity,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'REQUESTED')
            RETURNING *
            `,
      [
        transferNumber,
        sourceLocationId,
        destinationLocationId,
        itemId,
        batchId,
        quantity,
      ],
    );

    await client.query("COMMIT");

    return transferResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function dispatchTransfer(transferId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const transferResult = await client.query(
      `
            SELECT
                id,
                transfer_number,
                source_location_id,
                destination_location_id,
                item_id,
                batch_id,
                quantity,
                status
            FROM stock_transfers
            WHERE id = $1
            FOR UPDATE
            `,
      [transferId],
    );

    if (transferResult.rows.length === 0) {
      throw new Error("Transfer not found");
    }

    const transfer = transferResult.rows[0];

    if (transfer.status !== "REQUESTED") {
      throw new Error("Only requested transfers can be dispatched");
    }

    const inventoryResult = await client.query(
      `
            SELECT
                id,
                physical_quantity,
                reserved_quantity
            FROM inventory
            WHERE location_id = $1
              AND item_id = $2
              AND batch_id = $3
            FOR UPDATE
            `,
      [transfer.source_location_id, transfer.item_id, transfer.batch_id],
    );

    if (inventoryResult.rows.length === 0) {
      throw new Error("Source inventory not found");
    }

    const inventory = inventoryResult.rows[0];

    const availableQuantity =
      inventory.physical_quantity - inventory.reserved_quantity;

    if (transfer.quantity > availableQuantity) {
      throw new Error("Insufficient available stock");
    }

    await client.query(
      `
            UPDATE inventory
            SET
                physical_quantity = physical_quantity - $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            `,
      [transfer.quantity, inventory.id],
    );

    await client.query(
      `
            UPDATE stock_transfers
            SET status = 'DISPATCHED'
            WHERE id = $1
            `,
      [transferId],
    );

    await client.query(
      `
            INSERT INTO inventory_transactions
                (transaction_id, inventory_id, quantity, created_by)
            VALUES
                ($1, $2, $3, $4)
            `,
      [
        `TRANSFER-${transfer.transfer_number}`,
        inventory.id,
        -transfer.quantity,
        userId,
      ],
    );

    await client.query("COMMIT");

    return {
      transferId: transfer.id,
      status: "DISPATCHED",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function receiveTransfer(transferId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const transferResult = await client.query(
      `
            SELECT
                id,
                transfer_number,
                source_location_id,
                destination_location_id,
                item_id,
                batch_id,
                quantity,
                status
            FROM stock_transfers
            WHERE id = $1
            FOR UPDATE
            `,
      [transferId],
    );

    if (transferResult.rows.length === 0) {
      throw new Error("Transfer not found");
    }

    const transfer = transferResult.rows[0];

    if (transfer.status !== "DISPATCHED") {
      throw new Error("Only dispatched transfers can be received");
    }

    const inventoryResult = await client.query(
      `
            SELECT
                id,
                physical_quantity,
                reserved_quantity
            FROM inventory
            WHERE location_id = $1
              AND item_id = $2
              AND batch_id = $3
            FOR UPDATE
            `,
      [transfer.destination_location_id, transfer.item_id, transfer.batch_id],
    );

    if (inventoryResult.rows.length === 0) {
      throw new Error("Destination inventory not found");
    }

    const inventory = inventoryResult.rows[0];

    await client.query(
      `
            UPDATE inventory
            SET
                physical_quantity = physical_quantity + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            `,
      [transfer.quantity, inventory.id],
    );

    await client.query(
      `
            UPDATE stock_transfers
            SET status = 'RECEIVED'
            WHERE id = $1
            `,
      [transferId],
    );

    await client.query(
      `
            INSERT INTO inventory_transactions
                (transaction_id, inventory_id, quantity, created_by)
            VALUES
                ($1, $2, $3, $4)
            `,
      [
        `TRANSFER-${transfer.transfer_number}-RECEIPT`,
        inventory.id,
        transfer.quantity,
        userId,
      ],
    );

    await client.query("COMMIT");

    return {
      transferId: transfer.id,
      status: "RECEIVED",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
