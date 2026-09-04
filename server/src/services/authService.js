import pool from "../config/db.js";
import bcrypt from "bcrypt";

export async function authenticateUser(email, password) {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            u.password_hash,
            u.location_id,
            r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
        `,
        [email]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0];

    const passwordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordValid) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        locationId: user.location_id
    };
}