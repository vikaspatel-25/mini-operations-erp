import pool from "../config/db.js";

export async function getWorkOrderData() {
  const workOrdersResult = await pool.query(`
        SELECT
            wo.id,
            wo.work_order_number,
            l.name AS location,
            it.name AS item,
            wo.required_quantity,
            u.name AS assigned_user,
            wo.status,
            COALESCE(
                SUM(
                    i.physical_quantity - i.reserved_quantity
                ),
                0
            ) AS available_quantity
        FROM work_orders wo
        JOIN locations l
            ON wo.location_id = l.id
        JOIN items it
            ON wo.item_id = it.id
        JOIN users u
            ON wo.assigned_user_id = u.id
        LEFT JOIN inventory i
            ON i.location_id = wo.location_id
            AND i.item_id = wo.item_id
        GROUP BY
            wo.id,
            wo.work_order_number,
            l.name,
            it.name,
            wo.required_quantity,
            u.name,
            wo.status
        ORDER BY wo.id DESC
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

  const usersResult = await pool.query(`
        SELECT
            id,
            name,
            email
        FROM users
        ORDER BY name
    `);

  return {
    workOrders: workOrdersResult.rows,
    locations: locationsResult.rows,
    items: itemsResult.rows,
    users: usersResult.rows,
  };
}

export async function createWorkOrder({
  workOrderNumber,
  locationId,
  itemId,
  requiredQuantity,
  assignedUserId,
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
    [locationId, itemId],
  );

  const availableQuantity = Number(result.rows[0].available_quantity);

  const shortage = Math.max(requiredQuantity - availableQuantity, 0);

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
    [workOrderNumber, locationId, itemId, requiredQuantity, assignedUserId],
  );

  return {
    workOrder: workOrderResult.rows[0],
    availableQuantity,
    shortage,
  };
}
