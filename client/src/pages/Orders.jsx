import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getOrderData,
    createOrder
} from "@/services/orderService.js";

import API_URL from "@/services/api";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [orderNumber, setOrderNumber] = useState("");
    const [itemId, setItemId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateOrderNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);

        return `ORD-${timestamp}-${random}`;
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            setPageError("");

            const data = await getOrderData();

            setOrders(data.orders || []);
            setItems(data.items || []);
            setLocations(data.locations || []);
        } catch (error) {
            setPageError(
                error.message || "Failed to load customer orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setOrderNumber(generateOrderNumber());
        loadOrders();
    }, []);

    const generateNewOrderNumber = () => {
        setOrderNumber(generateOrderNumber());
        setCopied(false);
        setFormError("");
        setSuccess("");
    };

    const resetForm = () => {
        setOrderNumber(generateOrderNumber());
        setItemId("");
        setLocationId("");
        setQuantity("");
        setCopied(false);
    };

    const copyOrderNumber = async () => {
        if (!orderNumber) {
            return;
        }

        try {
            await navigator.clipboard.writeText(orderNumber);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error(
                "Failed to copy order ID:",
                error
            );
        }
    };

    const handleCreateOrder = async (event) => {
        event.preventDefault();

        setFormError("");
        setSuccess("");

        const numericItemId = Number(itemId);
        const numericLocationId = Number(locationId);
        const numericQuantity = Number(quantity);

        if (!orderNumber) {
            setFormError("Order ID could not be generated");
            return;
        }

        if (!Number.isInteger(numericItemId)) {
            setFormError("Please select an item");
            return;
        }

        if (!Number.isInteger(numericLocationId)) {
            setFormError("Please select a location");
            return;
        }

        if (
            !Number.isInteger(numericQuantity) ||
            numericQuantity <= 0
        ) {
            setFormError(
                "Quantity must be a positive integer"
            );
            return;
        }

        try {
            setSubmitting(true);

            const data = await createOrder({
                orderNumber,
                itemId: numericItemId,
                locationId: numericLocationId,
                quantity: numericQuantity
            });

            const reservedQuantity =
                data.result?.reservedQuantity;

            setSuccess(
                `Order created successfully. ${
                    reservedQuantity !== undefined
                        ? `Reserved quantity: ${reservedQuantity}`
                        : "Stock has been reserved."
                }`
            );

            resetForm();

            try {
                await loadOrders();
            } catch (error) {
                console.error(
                    "Failed to refresh orders:",
                    error
                );
            }
        } catch (error) {
            setFormError(
                error.message || "Failed to create order"
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
                                style={navLinkStyle}
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
                                style={{
                                    ...navLinkStyle,
                                    ...activeNavLinkStyle
                                }}
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
                        Customer Orders
                    </h1>

                    <p style={subtitleStyle}>
                        Create customer orders and reserve
                        available stock.
                    </p>
                </div>

                {pageError && (
                    <div style={pageErrorStyle}>
                        {pageError}
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
                            Create Customer Order
                        </h2>
                    </div>

                    {formError && (
                        <div style={formErrorStyle}>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleCreateOrder}>
                        <div style={formGridStyle}>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Order ID
                                </label>

                                <div
                                    style={
                                        orderNumberWrapperStyle
                                    }
                                >
                                    <input
                                        type="text"
                                        value={orderNumber}
                                        readOnly
                                        style={
                                            orderNumberInputStyle
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            copyOrderNumber
                                        }
                                        disabled={
                                            submitting ||
                                            !orderNumber
                                        }
                                        style={{
                                            ...copyButtonStyle,
                                            opacity:
                                                submitting ||
                                                !orderNumber
                                                    ? 0.6
                                                    : 1,
                                            cursor:
                                                submitting ||
                                                !orderNumber
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
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={quantity}
                                    onChange={(event) => {
                                        setQuantity(
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
                                    : "Create Order"}
                            </button>

                            <button
                                type="button"
                                onClick={generateNewOrderNumber}
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
                            Customer Orders
                        </h2>
                    </div>

                    {loading ? (
                        <div style={messageStyle}>
                            Loading orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={messageStyle}>
                            No customer orders found.
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
                                            Order
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
                                            Quantity
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "190px"
                                            }}
                                        >
                                            Created By
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "210px"
                                            }}
                                        >
                                            Created At
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            style={rowStyle}
                                        >
                                            <td style={tdStyle}>
                                                <span
                                                    style={
                                                        orderNumberStyle
                                                    }
                                                >
                                                    {
                                                        order.order_number
                                                    }
                                                </span>
                                            </td>

                                            <td style={tdStyle}>
                                                {order.item}
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    textAlign: "right",
                                                    fontWeight: "500"
                                                }}
                                            >
                                                {order.quantity}
                                            </td>

                                            <td style={tdStyle}>
                                                {
                                                    order.created_by
                                                }
                                            </td>

                                            <td style={tdStyle}>
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
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

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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

const orderNumberWrapperStyle = {
    display: "flex",
    width: "100%"
};

const orderNumberInputStyle = {
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
    minWidth: "130px",
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
    minWidth: "1020px",
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

const orderNumberStyle = {
    fontWeight: "500",
    color: "#0f172a"
};

const messageStyle = {
    padding: "50px 24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px"
};

export default Orders;