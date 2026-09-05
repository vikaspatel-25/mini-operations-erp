import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getInventory,
    adjustInventory
} from "@/services/inventoryService.js";

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedInventory, setSelectedInventory] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [adjusting, setAdjusting] = useState(false);

    const loadInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getInventory();

            setInventory(data.inventory || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const handleAdjust = async (event) => {
        event.preventDefault();

        try {
            setAdjusting(true);
            setError("");

            await adjustInventory(
                selectedInventory.id,
                Number(quantity),
                transactionId
            );

            setSelectedInventory(null);
            setQuantity("");
            setTransactionId("");

            await loadInventory();
        } catch (error) {
            setError(error.message);
        } finally {
            setAdjusting(false);
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
                    <strong
                        style={{
                            marginRight: "20px"
                        }}
                    >
                        Operations ERP
                    </strong>

                    <Link to="/inventory" style={navLinkStyle}>
                        Inventory
                    </Link>

                    <Link to="/work-orders" style={navLinkStyle}>
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
                        Inventory
                    </h1>

                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#64748b",
                            fontSize: "14px"
                        }}
                    >
                        View and manage inventory stock
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "10px 14px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            color: "#dc2626",
                            fontSize: "14px"
                        }}
                    >
                        {error}
                    </div>
                )}

                <div
                    style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        overflow: "hidden"
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#64748b"
                            }}
                        >
                            Loading inventory...
                        </div>
                    ) : inventory.length === 0 ? (
                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#64748b"
                            }}
                        >
                            No inventory found.
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "14px"
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: "#f8fafc",
                                            borderBottom:
                                                "1px solid #e2e8f0"
                                        }}
                                    >
                                        <th style={headerStyle}>
                                            Item
                                        </th>

                                        <th style={headerStyle}>
                                            Category
                                        </th>

                                        <th style={headerStyle}>
                                            Location
                                        </th>

                                        <th style={headerStyle}>
                                            Batch
                                        </th>

                                        <th style={headerStyle}>
                                            Physical
                                        </th>

                                        <th style={headerStyle}>
                                            Reserved
                                        </th>

                                        <th style={headerStyle}>
                                            Available
                                        </th>

                                        <th style={headerStyle}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inventory.map((row) => (
                                        <tr
                                            key={row.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #f1f5f9"
                                            }}
                                        >
                                            <td style={cellStyle}>
                                                {row.item}
                                            </td>

                                            <td style={cellStyle}>
                                                {row.category}
                                            </td>

                                            <td style={cellStyle}>
                                                {row.location}
                                            </td>

                                            <td style={cellStyle}>
                                                {row.batch}
                                            </td>

                                            <td style={cellStyle}>
                                                {row.physical_quantity}
                                            </td>

                                            <td style={cellStyle}>
                                                {row.reserved_quantity}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    fontWeight: "600"
                                                }}
                                            >
                                                {row.available_quantity}
                                            </td>

                                            <td style={cellStyle}>
                                                <button
                                                    onClick={() =>
                                                        setSelectedInventory(
                                                            row
                                                        )
                                                    }
                                                    style={{
                                                        border:
                                                            "1px solid #cbd5e1",
                                                        backgroundColor:
                                                            "#ffffff",
                                                        borderRadius: "6px",
                                                        padding:
                                                            "6px 10px",
                                                        cursor: "pointer",
                                                        fontSize: "13px"
                                                    }}
                                                >
                                                    Adjust
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedInventory && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor:
                            "rgba(15, 23, 42, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px"
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            padding: "24px",
                            boxShadow:
                                "0 10px 30px rgba(0, 0, 0, 0.12)"
                        }}
                    >
                        <h2
                            style={{
                                margin: "0 0 6px",
                                fontSize: "20px"
                            }}
                        >
                            Adjust Inventory
                        </h2>

                        <p
                            style={{
                                margin: "0 0 20px",
                                color: "#64748b",
                                fontSize: "14px"
                            }}
                        >
                            {selectedInventory.item} -{" "}
                            {selectedInventory.location}
                        </p>

                        <form onSubmit={handleAdjust}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={labelStyle}>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(event) =>
                                        setQuantity(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Use negative to remove stock"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={labelStyle}>
                                    Transaction ID
                                </label>

                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(event) =>
                                        setTransactionId(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. INV-001"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px"
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedInventory(null)
                                    }
                                    style={{
                                        flex: 1,
                                        height: "40px",
                                        border:
                                            "1px solid #cbd5e1",
                                        backgroundColor: "#ffffff",
                                        borderRadius: "7px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={adjusting}
                                    style={{
                                        flex: 1,
                                        height: "40px",
                                        border: "none",
                                        backgroundColor:
                                            adjusting
                                                ? "#64748b"
                                                : "#0f172a",
                                        color: "#ffffff",
                                        borderRadius: "7px",
                                        cursor: adjusting
                                            ? "not-allowed"
                                            : "pointer"
                                    }}
                                >
                                    {adjusting
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
    outline: "none"
};

export default Inventory;