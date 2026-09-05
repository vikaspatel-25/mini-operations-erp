import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getWorkOrderData,
    createWorkOrder
} from "@/services/workOrderService.js";

import API_URL from "@/services/api";

function WorkOrders() {
    const navigate = useNavigate();

    const [workOrders, setWorkOrders] = useState([]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [workOrderNumber, setWorkOrderNumber] = useState("");
    const [locationId, setLocationId] = useState("");
    const [itemId, setItemId] = useState("");
    const [requiredQuantity, setRequiredQuantity] = useState("");
    const [assignedUserId, setAssignedUserId] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateWorkOrderNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);

        return `WO-${timestamp}-${random}`;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setPageError("");

            const data = await getWorkOrderData();

            setWorkOrders(data.workOrders || []);
            setLocations(data.locations || []);
            setItems(data.items || []);
            setUsers(data.users || []);
        } catch (error) {
            setPageError(
                error.message || "Failed to load work orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setWorkOrderNumber(generateWorkOrderNumber());
        loadData();
    }, []);

    const generateNewWorkOrderNumber = () => {
        setWorkOrderNumber(generateWorkOrderNumber());
        setCopied(false);
        setFormError("");
        setSuccess("");
    };

    const resetForm = () => {
        setWorkOrderNumber(generateWorkOrderNumber());
        setLocationId("");
        setItemId("");
        setRequiredQuantity("");
        setAssignedUserId("");
        setCopied(false);
    };

    const copyWorkOrderNumber = async () => {
        if (!workOrderNumber) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                workOrderNumber
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error(
                "Failed to copy work order ID:",
                error
            );
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setSuccess("");

        const numericLocationId = Number(locationId);
        const numericItemId = Number(itemId);
        const numericRequiredQuantity =
            Number(requiredQuantity);
        const numericAssignedUserId =
            Number(assignedUserId);

        if (!workOrderNumber) {
            setFormError(
                "Work Order ID could not be generated"
            );
            return;
        }

        if (!Number.isInteger(numericLocationId)) {
            setFormError("Please select a location");
            return;
        }

        if (!Number.isInteger(numericItemId)) {
            setFormError("Please select an item");
            return;
        }

        if (
            !Number.isInteger(numericRequiredQuantity) ||
            numericRequiredQuantity <= 0
        ) {
            setFormError(
                "Required quantity must be a positive integer"
            );
            return;
        }

        if (!Number.isInteger(numericAssignedUserId)) {
            setFormError("Please select an assigned user");
            return;
        }

        try {
            setSubmitting(true);

            const data = await createWorkOrder({
                workOrderNumber,
                locationId: numericLocationId,
                itemId: numericItemId,
                requiredQuantity: numericRequiredQuantity,
                assignedUserId: numericAssignedUserId
            });

            setSuccess(
                `Work order created. Shortage: ${
                    data.result.shortage
                }`
            );

            resetForm();

            try {
                await loadData();
            } catch (error) {
                console.error(
                    "Failed to refresh work orders:",
                    error
                );
            }
        } catch (error) {
            setFormError(
                error.message || "Failed to create work order"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            navigate("/login");
        }
    };

    return (
        <div style={pageStyle}>
            <nav style={navStyle}>
                <div style={navInnerStyle}>
                    <Link
                        to="/inventory"
                        style={brandStyle}
                    >
                        <span style={brandAccentStyle}>
                            Operations
                        </span>{" "}
                        ERP
                    </Link>

                    <div style={navRightStyle}>
                        <div style={navLinksStyle}>
                            <Link
                                to="/inventory"
                                style={navLinkStyle}
                            >
                                Inventory
                            </Link>

                            <Link
                                to="/work-orders"
                                style={{
                                    ...navLinkStyle,
                                    ...activeNavLinkStyle
                                }}
                            >
                                Work Orders
                            </Link>

                            <Link
                                to="/transfers"
                                style={navLinkStyle}
                            >
                                Transfers
                            </Link>

                            <Link
                                to="/orders"
                                style={navLinkStyle}
                            >
                                Customer Orders
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            style={logoutButtonStyle}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main style={mainStyle}>
                <div style={pageHeaderStyle}>
                    <h1 style={titleStyle}>
                        Work Orders
                    </h1>

                    <p style={subtitleStyle}>
                        Create and monitor work orders.
                    </p>
                </div>

                {pageError && (
                    <div style={pageErrorStyle}>
                        {pageError}
                    </div>
                )}

                {formError && (
                    <div style={formErrorStyle}>
                        {formError}
                    </div>
                )}

                {success && (
                    <div style={successStyle}>
                        {success}
                    </div>
                )}

                <section style={formCardStyle}>
                    <div style={sectionHeaderStyle}>
                        <h2 style={sectionTitleStyle}>
                            Create Work Order
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={formGridStyle}>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Work Order ID
                                </label>

                                <div
                                    style={
                                        workOrderNumberWrapperStyle
                                    }
                                >
                                    <input
                                        type="text"
                                        value={
                                            workOrderNumber
                                        }
                                        readOnly
                                        style={
                                            workOrderNumberInputStyle
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            copyWorkOrderNumber
                                        }
                                        disabled={
                                            submitting ||
                                            !workOrderNumber
                                        }
                                        style={{
                                            ...copyButtonStyle,
                                            opacity:
                                                submitting ||
                                                !workOrderNumber
                                                    ? 0.6
                                                    : 1,
                                            cursor:
                                                submitting ||
                                                !workOrderNumber
                                                    ? "not-allowed"
                                                    : "pointer"
                                        }}
                                    >
                                        {copied
                                            ? "Copied"
                                            : "Copy"}
                                    </button>
                                </div>

                                <p style={fieldHintStyle}>
                                    Generated automatically and
                                    cannot be changed.
                                </p>
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Location
                                </label>

                                <select
                                    value={locationId}
                                    onChange={(event) => {
                                        setLocationId(
                                            event.target.value
                                        );
                                        setFormError("");
                                        setSuccess("");
                                    }}
                                    required
                                    disabled={submitting}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor:
                                            submitting
                                                ? "#f8fafc"
                                                : "#ffffff",
                                        cursor: submitting
                                            ? "not-allowed"
                                            : "pointer"
                                    }}
                                >
                                    <option value="">
                                        Select location
                                    </option>

                                    {locations.map(
                                        (location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Item
                                </label>

                                <select
                                    value={itemId}
                                    onChange={(event) => {
                                        setItemId(
                                            event.target.value
                                        );
                                        setFormError("");
                                        setSuccess("");
                                    }}
                                    required
                                    disabled={submitting}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor:
                                            submitting
                                                ? "#f8fafc"
                                                : "#ffffff",
                                        cursor: submitting
                                            ? "not-allowed"
                                            : "pointer"
                                    }}
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

                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Required Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        requiredQuantity
                                    }
                                    onChange={(event) => {
                                        setRequiredQuantity(
                                            event.target.value
                                        );
                                        setFormError("");
                                        setSuccess("");
                                    }}
                                    placeholder="Enter quantity"
                                    required
                                    disabled={submitting}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor:
                                            submitting
                                                ? "#f8fafc"
                                                : "#ffffff"
                                    }}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Assigned User
                                </label>

                                <select
                                    value={
                                        assignedUserId
                                    }
                                    onChange={(event) => {
                                        setAssignedUserId(
                                            event.target.value
                                        );
                                        setFormError("");
                                        setSuccess("");
                                    }}
                                    required
                                    disabled={submitting}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor:
                                            submitting
                                                ? "#f8fafc"
                                                : "#ffffff",
                                        cursor: submitting
                                            ? "not-allowed"
                                            : "pointer"
                                    }}
                                >
                                    <option value="">
                                        Select user
                                    </option>

                                    {users.map((user) => (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.name} (
                                            {user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={formActionsStyle}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: submitting
                                        ? "#94a3b8"
                                        : "#2563eb",
                                    cursor: submitting
                                        ? "not-allowed"
                                        : "pointer"
                                }}
                            >
                                {submitting
                                    ? "Creating..."
                                    : "Create Work Order"}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    generateNewWorkOrderNumber
                                }
                                disabled={submitting}
                                style={{
                                    ...newIdButtonStyle,
                                    opacity: submitting
                                        ? 0.6
                                        : 1,
                                    cursor: submitting
                                        ? "not-allowed"
                                        : "pointer"
                                }}
                            >
                                Generate New ID
                            </button>
                        </div>
                    </form>
                </section>

                <section style={tableCardStyle}>
                    <div style={tableHeaderStyle}>
                        <h2 style={sectionTitleStyle}>
                            Work Orders
                        </h2>
                    </div>

                    {loading ? (
                        <div style={messageStyle}>
                            Loading work orders...
                        </div>
                    ) : workOrders.length === 0 ? (
                        <div style={messageStyle}>
                            No work orders found.
                        </div>
                    ) : (
                        <div style={tableScrollStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "190px"
                                            }}
                                        >
                                            Work Order
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "180px"
                                            }}
                                        >
                                            Location
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "300px"
                                            }}
                                        >
                                            Item
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "130px",
                                                textAlign: "right"
                                            }}
                                        >
                                            Required
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "130px",
                                                textAlign: "right"
                                            }}
                                        >
                                            Available
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "120px",
                                                textAlign: "right"
                                            }}
                                        >
                                            Shortage
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "220px"
                                            }}
                                        >
                                            Assigned User
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "140px"
                                            }}
                                        >
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
                                                style={rowStyle}
                                            >
                                                <td style={tdStyle}>
                                                    <span
                                                        style={
                                                            workOrderNumberStyle
                                                        }
                                                    >
                                                        {
                                                            order.work_order_number
                                                        }
                                                    </span>
                                                </td>

                                                <td style={tdStyle}>
                                                    {order.location}
                                                </td>

                                                <td style={tdStyle}>
                                                    {order.item}
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "right"
                                                    }}
                                                >
                                                    {
                                                        order.required_quantity
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "right"
                                                    }}
                                                >
                                                    {available}
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "right",
                                                        fontWeight:
                                                            "600"
                                                    }}
                                                >
                                                    {shortage}
                                                </td>

                                                <td style={tdStyle}>
                                                    {
                                                        order.assigned_user
                                                    }
                                                </td>

                                                <td style={tdStyle}>
                                                    <span
                                                        style={
                                                            statusStyle
                                                        }
                                                    >
                                                        {
                                                            order.status
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc"
};

const navStyle = {
    width: "100%",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0"
};

const navInnerStyle = {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "0 40px",
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap"
};

const brandStyle = {
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.2px",
    whiteSpace: "nowrap"
};

const brandAccentStyle = {
    color: "#2563eb"
};

const navRightStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "24px",
    flexWrap: "wrap"
};

const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap"
};

const navLinkStyle = {
    textDecoration: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    padding: "23px 0",
    whiteSpace: "nowrap"
};

const activeNavLinkStyle = {
    color: "#2563eb",
    fontWeight: "600"
};

const logoutButtonStyle = {
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    borderRadius: "6px",
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap"
};

const mainStyle = {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "40px 40px 60px"
};

const pageHeaderStyle = {
    marginBottom: "26px"
};

const titleStyle = {
    margin: 0,
    fontSize: "28px",
    fontWeight: "600",
    color: "#0f172a"
};

const subtitleStyle = {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5"
};

const pageErrorStyle = {
    marginBottom: "20px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px"
};

const formErrorStyle = {
    marginBottom: "20px",
    padding: "11px 14px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    color: "#dc2626",
    fontSize: "13px",
    lineHeight: "1.4"
};

const successStyle = {
    marginBottom: "20px",
    padding: "12px 16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    color: "#166534",
    fontSize: "14px"
};

const formCardStyle = {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "26px",
    marginBottom: "28px"
};

const sectionHeaderStyle = {
    marginBottom: "22px"
};

const sectionTitleStyle = {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
    color: "#0f172a"
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px"
};

const fieldStyle = {
    minWidth: 0
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
    height: "42px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none"
};

const workOrderNumberWrapperStyle = {
    display: "flex",
    width: "100%"
};

const workOrderNumberInputStyle = {
    flex: 1,
    minWidth: 0,
    height: "42px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRight: "none",
    borderRadius: "7px 0 0 7px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: "13px",
    outline: "none"
};

const copyButtonStyle = {
    height: "42px",
    padding: "0 14px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    borderRadius: "0 7px 7px 0",
    fontSize: "13px",
    fontWeight: "500",
    flexShrink: 0
};

const fieldHintStyle = {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "12px"
};

const formActionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "22px",
    flexWrap: "wrap"
};

const buttonStyle = {
    minWidth: "150px",
    height: "42px",
    padding: "0 18px",
    border: "none",
    borderRadius: "7px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500"
};

const newIdButtonStyle = {
    height: "42px",
    padding: "0 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500"
};

const tableCardStyle = {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden"
};

const tableHeaderStyle = {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0"
};

const tableScrollStyle = {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch"
};

const tableStyle = {
    width: "100%",
    minWidth: "1400px",
    borderCollapse: "collapse",
    fontSize: "14px"
};

const thStyle = {
    textAlign: "left",
    padding: "15px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap"
};

const rowStyle = {
    borderBottom: "1px solid #f1f5f9"
};

const tdStyle = {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px",
    whiteSpace: "nowrap"
};

const workOrderNumberStyle = {
    fontWeight: "500",
    color: "#0f172a"
};

const statusStyle = {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "5px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "500"
};

const messageStyle = {
    padding: "50px 24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px"
};

export default WorkOrders;