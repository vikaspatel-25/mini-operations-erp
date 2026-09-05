import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getWorkOrderData,
    createWorkOrder
} from "@/services/workOrderService.js";

function WorkOrders() {
    const [workOrders, setWorkOrders] = useState([]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [workOrderNumber, setWorkOrderNumber] = useState("");
    const [locationId, setLocationId] = useState("");
    const [itemId, setItemId] = useState("");
    const [requiredQuantity, setRequiredQuantity] = useState("");
    const [assignedUserId, setAssignedUserId] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getWorkOrderData();

            setWorkOrders(data.workOrders || []);
            setLocations(data.locations || []);
            setItems(data.items || []);
            setUsers(data.users || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = await createWorkOrder({
                workOrderNumber,
                locationId: Number(locationId),
                itemId: Number(itemId),
                requiredQuantity: Number(requiredQuantity),
                assignedUserId: Number(assignedUserId)
            });

            setSuccess(
                `Work order created. Shortage: ${data.result.shortage}`
            );

            setWorkOrderNumber("");
            setLocationId("");
            setItemId("");
            setRequiredQuantity("");
            setAssignedUserId("");

            await loadData();
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                padding: "32px"
            }}
        >
            <nav
                style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "14px 32px",
                    margin: "-32px -32px 32px"
                }}
            >
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "24px"
                    }}
                >
                    <strong style={{ marginRight: "20px" }}>
                        Operations ERP
                    </strong>

                    <Link to="/inventory" style={navLinkStyle}>
                        Inventory
                    </Link>

                    <Link
                        to="/work-orders"
                        style={{
                            ...navLinkStyle,
                            fontWeight: "600"
                        }}
                    >
                        Work Orders
                    </Link>

                    <Link to="/transfers" style={navLinkStyle}>
                        Transfers
                    </Link>

                    <Link to="/orders" style={navLinkStyle}>
                        Customer Orders
                    </Link>
                </div>
            </nav>

            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto"
                }}
            >
                <div style={{ marginBottom: "24px" }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "26px",
                            fontWeight: "600"
                        }}
                    >
                        Work Orders
                    </h1>

                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#64748b",
                            fontSize: "14px"
                        }}
                    >
                        Create and monitor work orders
                    </p>
                </div>

                {error && (
                    <div style={errorStyle}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={successStyle}>
                        {success}
                    </div>
                )}

                <div
                    style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "24px",
                        marginBottom: "24px"
                    }}
                >
                    <h2
                        style={{
                            margin: "0 0 20px",
                            fontSize: "18px"
                        }}
                    >
                        Create Work Order
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "16px"
                        }}
                    >
                        <div>
                            <label style={labelStyle}>
                                Work Order ID
                            </label>

                            <input
                                value={workOrderNumber}
                                onChange={(event) =>
                                    setWorkOrderNumber(
                                        event.target.value
                                    )
                                }
                                placeholder="WO-001"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Location
                            </label>

                            <select
                                value={locationId}
                                onChange={(event) =>
                                    setLocationId(
                                        event.target.value
                                    )
                                }
                                required
                                style={inputStyle}
                            >
                                <option value="">
                                    Select location
                                </option>

                                {locations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Item
                            </label>

                            <select
                                value={itemId}
                                onChange={(event) =>
                                    setItemId(
                                        event.target.value
                                    )
                                }
                                required
                                style={inputStyle}
                            >
                                <option value="">
                                    Select item
                                </option>

                                {items.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Required Quantity
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={requiredQuantity}
                                onChange={(event) =>
                                    setRequiredQuantity(
                                        event.target.value
                                    )
                                }
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Assigned User
                            </label>

                            <select
                                value={assignedUserId}
                                onChange={(event) =>
                                    setAssignedUserId(
                                        event.target.value
                                    )
                                }
                                required
                                style={inputStyle}
                            >
                                <option value="">
                                    Select user
                                </option>

                                {users.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "end"
                            }}
                        >
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    width: "100%",
                                    height: "40px",
                                    border: "none",
                                    borderRadius: "7px",
                                    backgroundColor:
                                        saving
                                            ? "#64748b"
                                            : "#0f172a",
                                    color: "#ffffff",
                                    cursor: saving
                                        ? "not-allowed"
                                        : "pointer"
                                }}
                            >
                                {saving
                                    ? "Creating..."
                                    : "Create Work Order"}
                            </button>
                        </div>
                    </form>
                </div>

                <div
                    style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        overflow: "hidden"
                    }}
                >
                    {loading ? (
                        <div style={emptyStyle}>
                            Loading work orders...
                        </div>
                    ) : workOrders.length === 0 ? (
                        <div style={emptyStyle}>
                            No work orders found.
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                    fontSize: "14px"
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor:
                                                "#f8fafc",
                                            borderBottom:
                                                "1px solid #e2e8f0"
                                        }}
                                    >
                                        <th style={headerStyle}>
                                            Work Order
                                        </th>

                                        <th style={headerStyle}>
                                            Location
                                        </th>

                                        <th style={headerStyle}>
                                            Item
                                        </th>

                                        <th style={headerStyle}>
                                            Required
                                        </th>

                                        <th style={headerStyle}>
                                            Available
                                        </th>

                                        <th style={headerStyle}>
                                            Shortage
                                        </th>

                                        <th style={headerStyle}>
                                            Assigned User
                                        </th>

                                        <th style={headerStyle}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {workOrders.map((order) => {
                                        const available =
                                            Number(
                                                order.available_quantity
                                            );

                                        const shortage =
                                            Math.max(
                                                Number(
                                                    order.required_quantity
                                                ) -
                                                    available,
                                                0
                                            );

                                        return (
                                            <tr
                                                key={order.id}
                                                style={{
                                                    borderBottom:
                                                        "1px solid #f1f5f9"
                                                }}
                                            >
                                                <td style={cellStyle}>
                                                    {
                                                        order.work_order_number
                                                    }
                                                </td>

                                                <td style={cellStyle}>
                                                    {order.location}
                                                </td>

                                                <td style={cellStyle}>
                                                    {order.item}
                                                </td>

                                                <td style={cellStyle}>
                                                    {
                                                        order.required_quantity
                                                    }
                                                </td>

                                                <td style={cellStyle}>
                                                    {available}
                                                </td>

                                                <td
                                                    style={{
                                                        ...cellStyle,
                                                        fontWeight:
                                                            "600"
                                                    }}
                                                >
                                                    {shortage}
                                                </td>

                                                <td style={cellStyle}>
                                                    {
                                                        order.assigned_user
                                                    }
                                                </td>

                                                <td style={cellStyle}>
                                                    {order.status}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const navLinkStyle = {
    textDecoration: "none",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500"
};

const headerStyle = {
    textAlign: "left",
    padding: "13px 16px",
    color: "#475569",
    fontWeight: "600"
};

const cellStyle = {
    padding: "13px 16px",
    color: "#334155"
};

const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155"
};

const inputStyle = {
    width: "100%",
    height: "40px",
    padding: "0 11px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff"
};

const errorStyle = {
    marginBottom: "20px",
    padding: "10px 14px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px"
};

const successStyle = {
    marginBottom: "20px",
    padding: "10px 14px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    color: "#166534",
    fontSize: "14px"
};

const emptyStyle = {
    padding: "40px",
    textAlign: "center",
    color: "#64748b"
};

export default WorkOrders;