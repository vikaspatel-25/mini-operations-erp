import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getOrderData,
    createOrder
} from "@/services/orderService.js";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [orderNumber, setOrderNumber] = useState("");
    const [itemId, setItemId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [submitting, setSubmitting] = useState(false);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const data = await getOrderData();

            setOrders(data.orders);
            setItems(data.items);
            setLocations(data.locations);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function handleCreateOrder(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const data = await createOrder({
                orderNumber,
                itemId: Number(itemId),
                locationId: Number(locationId),
                quantity: Number(quantity)
            });

            setSuccess(
                `Order created successfully. ${data.result?.reservedQuantity !== undefined
                    ? `Reserved quantity: ${data.result.reservedQuantity}`
                    : "Stock has been reserved."}`
            );

            setOrderNumber("");
            setItemId("");
            setLocationId("");
            setQuantity("");

            await loadOrders();

        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc"
            }}
        >
            <header
                style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "16px 32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "20px"
                    }}
                >
                    Mini Operations ERP
                </h2>

                <nav
                    style={{
                        display: "flex",
                        gap: "20px"
                    }}
                >
                    <Link to="/inventory">
                        Inventory
                    </Link>

                    <Link to="/work-orders">
                        Work Orders
                    </Link>

                    <Link to="/transfers">
                        Transfers
                    </Link>

                    <Link to="/orders">
                        Orders
                    </Link>
                </nav>
            </header>

            <main
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "32px"
                }}
            >
                <div
                    style={{
                        marginBottom: "24px"
                    }}
                >
                    <h1
                        style={{
                            margin: "0 0 6px",
                            fontSize: "26px"
                        }}
                    >
                        Customer Orders
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#64748b"
                        }}
                    >
                        Create customer orders and reserve available stock.
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "12px 16px",
                            borderRadius: "6px",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "1px solid #fecaca"
                        }}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "12px 16px",
                            borderRadius: "6px",
                            background: "#dcfce7",
                            color: "#166534",
                            border: "1px solid #bbf7d0"
                        }}
                    >
                        {success}
                    </div>
                )}

                <section
                    style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "24px",
                        marginBottom: "28px"
                    }}
                >
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: "20px"
                        }}
                    >
                        Create Customer Order
                    </h3>

                    <form onSubmit={handleCreateOrder}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2, 1fr)",
                                gap: "16px"
                            }}
                        >
                            <div>
                                <label>
                                    Order ID
                                </label>

                                <input
                                    value={orderNumber}
                                    onChange={(e) =>
                                        setOrderNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="ORD-001"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label>
                                    Location
                                </label>

                                <select
                                    value={locationId}
                                    onChange={(e) =>
                                        setLocationId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">
                                        Select location
                                    </option>

                                    {locations.map(
                                        (location) => (
                                            <option
                                                key={
                                                    location.id
                                                }
                                                value={
                                                    location.id
                                                }
                                            >
                                                {
                                                    location.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label>
                                    Item
                                </label>

                                <select
                                    value={itemId}
                                    onChange={(e) =>
                                        setItemId(
                                            e.target.value
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
                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            e.target.value
                                        )
                                    }
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={buttonStyle}
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Order"}
                        </button>
                    </form>
                </section>

                <section
                    style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        overflow: "hidden"
                    }}
                >
                    <div
                        style={{
                            padding: "20px 24px",
                            borderBottom:
                                "1px solid #e2e8f0"
                        }}
                    >
                        <h3 style={{ margin: 0 }}>
                            Customer Orders
                        </h3>
                    </div>

                    {loading ? (
                        <p
                            style={{
                                padding: "24px",
                                color: "#64748b"
                            }}
                        >
                            Loading orders...
                        </p>
                    ) : orders.length === 0 ? (
                        <p
                            style={{
                                padding: "24px",
                                color: "#64748b"
                            }}
                        >
                            No customer orders found.
                        </p>
                    ) : (
                        <div
                            style={{
                                overflowX: "auto"
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse"
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={thStyle}>
                                            Order
                                        </th>

                                        <th style={thStyle}>
                                            Item
                                        </th>

                                        <th style={thStyle}>
                                            Quantity
                                        </th>

                                        <th style={thStyle}>
                                            Created By
                                        </th>

                                        <th style={thStyle}>
                                            Created At
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                        >
                                            <td
                                                style={tdStyle}
                                            >
                                                {
                                                    order.order_number
                                                }
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >
                                                {order.item}
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >
                                                {
                                                    order.quantity
                                                }
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >
                                                {
                                                    order.created_by
                                                }
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >
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

const inputStyle = {
    width: "100%",
    marginTop: "6px",
    padding: "9px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
    fontSize: "14px",
    background: "#ffffff"
};

const buttonStyle = {
    marginTop: "20px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "5px",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px"
};

const thStyle = {
    textAlign: "left",
    padding: "12px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px"
};

const tdStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px"
};

export default Orders;