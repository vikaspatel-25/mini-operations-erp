import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getTransferData,
    createTransfer,
    dispatchTransfer,
    receiveTransfer
} from "@/services/transferService";

import API_URL from "@/services/api";

function Transfers() {
    const navigate = useNavigate();

    const [transfers, setTransfers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [batches, setBatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [transferNumber, setTransferNumber] = useState("");
    const [sourceLocationId, setSourceLocationId] = useState("");
    const [destinationLocationId, setDestinationLocationId] = useState("");
    const [itemId, setItemId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [copied, setCopied] = useState(false);

    const generateTransferNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);

        return `TRF-${timestamp}-${random}`;
    };

    const loadTransfers = async () => {
        try {
            setLoading(true);
            setPageError("");

            const data = await getTransferData();

            setTransfers(data.transfers || []);
            setLocations(data.locations || []);
            setItems(data.items || []);
            setBatches(data.batches || []);
        } catch (error) {
            setPageError(
                error.message || "Failed to load transfers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTransferNumber(generateTransferNumber());
        loadTransfers();
    }, []);

    const filteredBatches = batches.filter(
        (batch) => batch.item_id === Number(itemId)
    );

    const handleItemChange = (value) => {
        setItemId(value);
        setBatchId("");
        setFormError("");
        setSuccess("");
    };

    const generateNewTransferNumber = () => {
        setTransferNumber(generateTransferNumber());
        setCopied(false);
        setFormError("");
        setSuccess("");
    };

    const resetForm = () => {
        setTransferNumber(generateTransferNumber());
        setSourceLocationId("");
        setDestinationLocationId("");
        setItemId("");
        setBatchId("");
        setQuantity("");
        setCopied(false);
    };

    const copyTransferNumber = async () => {
        if (!transferNumber) {
            return;
        }

        try {
            await navigator.clipboard.writeText(transferNumber);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error(
                "Failed to copy transfer ID:",
                error
            );
        }
    };

    const handleCreateTransfer = async (event) => {
        event.preventDefault();

        setFormError("");
        setSuccess("");

        const numericSourceLocationId =
            Number(sourceLocationId);

        const numericDestinationLocationId =
            Number(destinationLocationId);

        const numericItemId = Number(itemId);
        const numericBatchId = Number(batchId);
        const numericQuantity = Number(quantity);

        if (!transferNumber) {
            setFormError(
                "Transfer ID could not be generated"
            );
            return;
        }

        if (!Number.isInteger(numericSourceLocationId)) {
            setFormError("Please select a source location");
            return;
        }

        if (
            !Number.isInteger(
                numericDestinationLocationId
            )
        ) {
            setFormError(
                "Please select a destination location"
            );
            return;
        }

        if (
            numericSourceLocationId ===
            numericDestinationLocationId
        ) {
            setFormError(
                "Source and destination locations must be different"
            );
            return;
        }

        if (!Number.isInteger(numericItemId)) {
            setFormError("Please select an item");
            return;
        }

        if (!Number.isInteger(numericBatchId)) {
            setFormError("Please select a batch");
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

            await createTransfer({
                transferNumber,
                sourceLocationId: numericSourceLocationId,
                destinationLocationId:
                    numericDestinationLocationId,
                itemId: numericItemId,
                batchId: numericBatchId,
                quantity: numericQuantity
            });

            setSuccess(
                "Transfer request created successfully."
            );

            resetForm();

            try {
                await loadTransfers();
            } catch (error) {
                console.error(
                    "Failed to refresh transfers:",
                    error
                );
            }
        } catch (error) {
            setFormError(
                error.message || "Failed to create transfer"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDispatch = async (id) => {
        setFormError("");
        setSuccess("");
        setActionId(id);

        try {
            await dispatchTransfer(id);

            setSuccess(
                "Transfer dispatched successfully."
            );

            try {
                await loadTransfers();
            } catch (error) {
                console.error(
                    "Failed to refresh transfers:",
                    error
                );
            }
        } catch (error) {
            setFormError(
                error.message || "Failed to dispatch transfer"
            );
        } finally {
            setActionId(null);
        }
    };

    const handleReceive = async (id) => {
        setFormError("");
        setSuccess("");
        setActionId(id);

        try {
            await receiveTransfer(id);

            setSuccess(
                "Transfer received successfully."
            );

            try {
                await loadTransfers();
            } catch (error) {
                console.error(
                    "Failed to refresh transfers:",
                    error
                );
            }
        } catch (error) {
            setFormError(
                error.message || "Failed to receive transfer"
            );
        } finally {
            setActionId(null);
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
                                style={{
                                    ...navLinkStyle,
                                    ...activeNavLinkStyle
                                }}
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
                        Internal Transfers
                    </h1>

                    <p style={subtitleStyle}>
                        Request, dispatch and receive stock
                        transfers.
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
                            Create Transfer
                        </h2>
                    </div>

                    <form onSubmit={handleCreateTransfer}>
                        <div style={formGridStyle}>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>
                                    Transfer ID
                                </label>

                                <div
                                    style={
                                        transferNumberWrapperStyle
                                    }
                                >
                                    <input
                                        type="text"
                                        value={transferNumber}
                                        readOnly
                                        style={
                                            transferNumberInputStyle
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            copyTransferNumber
                                        }
                                        disabled={
                                            submitting ||
                                            !transferNumber
                                        }
                                        style={{
                                            ...copyButtonStyle,
                                            opacity:
                                                submitting ||
                                                !transferNumber
                                                    ? 0.6
                                                    : 1,
                                            cursor:
                                                submitting ||
                                                !transferNumber
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
                                    Source Location
                                </label>

                                <select
                                    value={sourceLocationId}
                                    onChange={(event) => {
                                        setSourceLocationId(
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
                                        Select source
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
                                    Destination Location
                                </label>

                                <select
                                    value={
                                        destinationLocationId
                                    }
                                    onChange={(event) => {
                                        setDestinationLocationId(
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
                                        Select destination
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
                                    onChange={(event) =>
                                        handleItemChange(
                                            event.target.value
                                        )
                                    }
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
                                    Batch
                                </label>

                                <select
                                    value={batchId}
                                    onChange={(event) => {
                                        setBatchId(
                                            event.target.value
                                        );
                                        setFormError("");
                                        setSuccess("");
                                    }}
                                    required
                                    disabled={
                                        !itemId ||
                                        submitting
                                    }
                                    style={{
                                        ...inputStyle,
                                        backgroundColor:
                                            !itemId ||
                                            submitting
                                                ? "#f8fafc"
                                                : "#ffffff",
                                        cursor:
                                            !itemId ||
                                            submitting
                                                ? "not-allowed"
                                                : "pointer"
                                    }}
                                >
                                    <option value="">
                                        Select batch
                                    </option>

                                    {filteredBatches.map(
                                        (batch) => (
                                            <option
                                                key={batch.id}
                                                value={batch.id}
                                            >
                                                {batch.batch_number}
                                            </option>
                                        )
                                    )}
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
                                    : "Create Transfer"}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    generateNewTransferNumber
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
                            Transfer History
                        </h2>
                    </div>

                    {loading ? (
                        <div style={messageStyle}>
                            Loading transfers...
                        </div>
                    ) : transfers.length === 0 ? (
                        <div style={messageStyle}>
                            No transfers found.
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
                                            Transfer
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "180px"
                                            }}
                                        >
                                            Source
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "200px"
                                            }}
                                        >
                                            Destination
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "280px"
                                            }}
                                        >
                                            Item
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "180px"
                                            }}
                                        >
                                            Batch
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "120px",
                                                textAlign: "right"
                                            }}
                                        >
                                            Quantity
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "140px"
                                            }}
                                        >
                                            Status
                                        </th>

                                        <th
                                            style={{
                                                ...thStyle,
                                                minWidth: "150px"
                                            }}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transfers.map(
                                        (transfer) => (
                                            <tr
                                                key={transfer.id}
                                                style={rowStyle}
                                            >
                                                <td style={tdStyle}>
                                                    <span
                                                        style={
                                                            transferNumberStyle
                                                        }
                                                    >
                                                        {
                                                            transfer.transfer_number
                                                        }
                                                    </span>
                                                </td>

                                                <td style={tdStyle}>
                                                    {
                                                        transfer.source_location
                                                    }
                                                </td>

                                                <td style={tdStyle}>
                                                    {
                                                        transfer.destination_location
                                                    }
                                                </td>

                                                <td style={tdStyle}>
                                                    {transfer.item}
                                                </td>

                                                <td style={tdStyle}>
                                                    {transfer.batch}
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "right",
                                                        fontWeight:
                                                            "500"
                                                    }}
                                                >
                                                    {
                                                        transfer.quantity
                                                    }
                                                </td>

                                                <td style={tdStyle}>
                                                    <span
                                                        style={
                                                            statusStyle
                                                        }
                                                    >
                                                        {
                                                            transfer.status
                                                        }
                                                    </span>
                                                </td>

                                                <td style={tdStyle}>
                                                    {transfer.status ===
                                                        "REQUESTED" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDispatch(
                                                                    transfer.id
                                                                )
                                                            }
                                                            disabled={
                                                                actionId ===
                                                                transfer.id
                                                            }
                                                            style={{
                                                                ...actionButtonStyle,
                                                                opacity:
                                                                    actionId ===
                                                                    transfer.id
                                                                        ? 0.6
                                                                        : 1,
                                                                cursor:
                                                                    actionId ===
                                                                    transfer.id
                                                                        ? "not-allowed"
                                                                        : "pointer"
                                                            }}
                                                        >
                                                            {actionId ===
                                                            transfer.id
                                                                ? "Processing..."
                                                                : "Dispatch"}
                                                        </button>
                                                    )}

                                                    {transfer.status ===
                                                        "DISPATCHED" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleReceive(
                                                                    transfer.id
                                                                )
                                                            }
                                                            disabled={
                                                                actionId ===
                                                                transfer.id
                                                            }
                                                            style={{
                                                                ...actionButtonStyle,
                                                                opacity:
                                                                    actionId ===
                                                                    transfer.id
                                                                        ? 0.6
                                                                        : 1,
                                                                cursor:
                                                                    actionId ===
                                                                    transfer.id
                                                                        ? "not-allowed"
                                                                        : "pointer"
                                                            }}
                                                        >
                                                            {actionId ===
                                                            transfer.id
                                                                ? "Processing..."
                                                                : "Receive"}
                                                        </button>
                                                    )}

                                                    {transfer.status ===
                                                        "RECEIVED" && (
                                                        <span
                                                            style={
                                                                completedStyle
                                                            }
                                                        >
                                                            Completed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
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

const transferNumberWrapperStyle = {
    display: "flex",
    width: "100%"
};

const transferNumberInputStyle = {
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
    minWidth: "145px",
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
    minWidth: "1350px",
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

const transferNumberStyle = {
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

const actionButtonStyle = {
    height: "34px",
    padding: "0 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "500"
};

const completedStyle = {
    color: "#64748b",
    fontSize: "13px"
};

const messageStyle = {
    padding: "50px 24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px"
};

export default Transfers;