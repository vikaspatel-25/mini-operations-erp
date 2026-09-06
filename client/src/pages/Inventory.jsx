import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getInventory,
    adjustInventory
} from "@/services/inventoryService.js";
import API_URL from "@/services/api";

function Inventory() {
    const navigate = useNavigate();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedLocation, setSelectedLocation] = useState("Mumbai");

    const [selectedInventory, setSelectedInventory] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [adjusting, setAdjusting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [modalError, setModalError] = useState("");

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

    const locations = [
        ...new Set(inventory.map((row) => row.location))
    ];

    const filteredInventory =
        selectedLocation === ""
            ? inventory
            : inventory.filter(
                  (row) => row.location === selectedLocation
              );

    const generateTransactionId = () => {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);

        return `INV-TXN-${timestamp}-${random}`;
    };

    const openAdjustModal = (row) => {
        setSelectedInventory(row);
        setQuantity("");
        setTransactionId(generateTransactionId());
        setCopied(false);
        setModalError("");
        setError("");
    };

    const closeAdjustModal = () => {
        if (adjusting) {
            return;
        }

        setSelectedInventory(null);
        setQuantity("");
        setTransactionId("");
        setCopied(false);
        setModalError("");
    };

    const copyTransactionId = async () => {
        try {
            await navigator.clipboard.writeText(transactionId);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Failed to copy transaction ID:", error);
        }
    };

    const handleAdjust = async (event) => {
        event.preventDefault();

        try {
            setAdjusting(true);
            setModalError("");
            setError("");

            await adjustInventory(
                selectedInventory.id,
                Number(quantity),
                transactionId
            );

            setSelectedInventory(null);
            setQuantity("");
            setTransactionId("");
            setCopied(false);
            setModalError("");

            await loadInventory();
        } catch (error) {
            setModalError(error.message);
        } finally {
            setAdjusting(false);
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
                    <Link to="/inventory" style={brandStyle}>
                        <span style={brandAccentStyle}>
                            Operations
                        </span>{" "}
                        ERP
                    </Link>

                    <div style={navRightStyle}>
                        <div style={navLinksStyle}>
                            <Link
                                to="/inventory"
                                style={{
                                    ...navLinkStyle,
                                    ...activeNavLinkStyle
                                }}
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
                        Inventory
                    </h1>

                    <p style={subtitleStyle}>
                        View and manage inventory stock
                    </p>
                </div>

                {error && (
                    <div style={errorStyle}>
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            style={errorCloseButtonStyle}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div style={filterContainerStyle}>
                    <label style={filterLabelStyle}>
                        Location
                    </label>

                    <select
                        value={selectedLocation}
                        onChange={(event) =>
                            setSelectedLocation(event.target.value)
                        }
                        style={filterSelectStyle}
                    >
                        <option value="">
                            All Locations
                        </option>

                        {locations.map((location) => (
                            <option
                                key={location}
                                value={location}
                            >
                                {location}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={tableContainerStyle}>
                    {loading ? (
                        <div style={messageStyle}>
                            Loading inventory...
                        </div>
                    ) : inventory.length === 0 ? (
                        <div style={messageStyle}>
                            No inventory found.
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div style={messageStyle}>
                            No inventory found for this location.
                        </div>
                    ) : (
                        <div style={tableScrollStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
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

                                        <th
                                            style={{
                                                ...headerStyle,
                                                textAlign: "right"
                                            }}
                                        >
                                            Physical
                                        </th>

                                        <th
                                            style={{
                                                ...headerStyle,
                                                textAlign: "right"
                                            }}
                                        >
                                            Reserved
                                        </th>

                                        <th
                                            style={{
                                                ...headerStyle,
                                                textAlign: "right"
                                            }}
                                        >
                                            Available
                                        </th>

                                        <th
                                            style={{
                                                ...headerStyle,
                                                textAlign: "center"
                                            }}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredInventory.map((row) => (
                                        <tr
                                            key={row.id}
                                            style={rowStyle}
                                        >
                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    minWidth: "280px",
                                                    fontWeight: "500",
                                                    color: "#0f172a"
                                                }}
                                            >
                                                {row.item}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    minWidth: "150px"
                                                }}
                                            >
                                                {row.category}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    minWidth: "140px"
                                                }}
                                            >
                                                {row.location}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    minWidth: "150px"
                                                }}
                                            >
                                                {row.batch}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    textAlign: "right",
                                                    minWidth: "110px"
                                                }}
                                            >
                                                {row.physical_quantity}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    textAlign: "right",
                                                    minWidth: "110px"
                                                }}
                                            >
                                                {row.reserved_quantity}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    textAlign: "right",
                                                    minWidth: "110px",
                                                    fontWeight: "600",
                                                    color: "#0f172a"
                                                }}
                                            >
                                                {row.available_quantity}
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    textAlign: "center",
                                                    minWidth: "120px"
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAdjustModal(row)
                                                    }
                                                    style={adjustButtonStyle}
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
            </main>

            {selectedInventory && (
                <div
                    style={modalOverlayStyle}
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !adjusting
                        ) {
                            closeAdjustModal();
                        }
                    }}
                >
                    <div style={modalStyle}>
                        <div style={modalHeaderStyle}>
                            <div>
                                <h2 style={modalTitleStyle}>
                                    Adjust Inventory
                                </h2>

                                <p style={modalSubtitleStyle}>
                                    {selectedInventory.item} -{" "}
                                    {selectedInventory.location}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAdjustModal}
                                disabled={adjusting}
                                style={modalCloseButtonStyle}
                                aria-label="Close dialog"
                            >
                                ×
                            </button>
                        </div>

                        {modalError && (
                            <div style={modalErrorStyle}>
                                <span>{modalError}</span>

                                <button
                                    type="button"
                                    onClick={() => setModalError("")}
                                    style={modalErrorCloseButtonStyle}
                                    aria-label="Dismiss error"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleAdjust}>
                            <div style={fieldStyle}>
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
                                    disabled={adjusting}
                                    style={inputStyle}
                                />
                            </div>

                            <div
                                style={{
                                    ...fieldStyle,
                                    marginBottom: "24px"
                                }}
                            >
                                <label style={labelStyle}>
                                    Transaction ID
                                </label>

                                <div style={transactionWrapperStyle}>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        readOnly
                                        style={transactionInputStyle}
                                    />

                                    <button
                                        type="button"
                                        onClick={copyTransactionId}
                                        disabled={adjusting}
                                        style={copyButtonStyle}
                                    >
                                        {copied
                                            ? "Copied"
                                            : "Copy"}
                                    </button>
                                </div>

                                <p style={transactionHintStyle}>
                                    Generated automatically and cannot
                                    be changed.
                                </p>
                            </div>

                            <div style={modalActionsStyle}>
                                <button
                                    type="button"
                                    onClick={closeAdjustModal}
                                    disabled={adjusting}
                                    style={{
                                        ...cancelButtonStyle,
                                        cursor: adjusting
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: adjusting ? 0.6 : 1
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={adjusting}
                                    style={{
                                        ...saveButtonStyle,
                                        backgroundColor: adjusting
                                            ? "#64748b"
                                            : "#2563eb",
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
    justifyContent: "space-between"
};

const brandStyle = {
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.2px"
};

const brandAccentStyle = {
    color: "#2563eb"
};

const navRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "28px"
};

const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "28px"
};

const navLinkStyle = {
    textDecoration: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    padding: "23px 0"
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
    fontWeight: "500"
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
    fontSize: "14px"
};

const errorStyle = {
    marginBottom: "20px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px"
};

const errorCloseButtonStyle = {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    fontSize: "20px",
    lineHeight: 1,
    padding: "0 2px",
    cursor: "pointer"
};

const filterContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px"
};

const filterLabelStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155"
};

const filterSelectStyle = {
    height: "40px",
    minWidth: "180px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer"
};

const tableContainerStyle = {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden"
};

const tableScrollStyle = {
    width: "100%",
    overflowX: "auto"
};

const tableStyle = {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
    fontSize: "14px"
};

const headerStyle = {
    padding: "15px 20px",
    textAlign: "left",
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

const cellStyle = {
    padding: "16px 20px",
    color: "#334155",
    whiteSpace: "nowrap"
};

const adjustButtonStyle = {
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    borderRadius: "6px",
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
};

const messageStyle = {
    padding: "50px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px"
};

const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000
};

const modalStyle = {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "28px",
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.14)"
};

const modalHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px"
};

const modalTitleStyle = {
    margin: "0 0 6px",
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a"
};

const modalSubtitleStyle = {
    margin: "0 0 24px",
    color: "#64748b",
    fontSize: "14px"
};

const modalCloseButtonStyle = {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "24px",
    lineHeight: 1,
    padding: "0",
    cursor: "pointer"
};

const modalErrorStyle = {
    marginBottom: "18px",
    padding: "11px 13px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    color: "#dc2626",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px"
};

const modalErrorCloseButtonStyle = {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    fontSize: "18px",
    lineHeight: 1,
    padding: "0",
    cursor: "pointer"
};

const fieldStyle = {
    marginBottom: "18px"
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

const transactionWrapperStyle = {
    display: "flex",
    width: "100%"
};

const transactionInputStyle = {
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
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
};

const transactionHintStyle = {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "12px"
};

const modalActionsStyle = {
    display: "flex",
    gap: "10px"
};

const cancelButtonStyle = {
    flex: 1,
    height: "42px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
};

const saveButtonStyle = {
    flex: 1,
    height: "42px",
    border: "none",
    color: "#ffffff",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "500"
};

export default Inventory;