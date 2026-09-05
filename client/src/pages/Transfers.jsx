import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getTransferData,
    createTransfer,
    dispatchTransfer,
    receiveTransfer
} from "@/services/transferService";

function Transfers() {
    const [transfers, setTransfers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [batches, setBatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [transferNumber, setTransferNumber] = useState("");
    const [sourceLocationId, setSourceLocationId] = useState("");
    const [destinationLocationId, setDestinationLocationId] = useState("");
    const [itemId, setItemId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [actionId, setActionId] = useState(null);

    async function loadTransfers() {
        try {
            setLoading(true);
            setError("");

            const data = await getTransferData();

            setTransfers(data.transfers);
            setLocations(data.locations);
            setItems(data.items);
            setBatches(data.batches);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTransfers();
    }, []);

    const filteredBatches = batches.filter(
        (batch) => batch.item_id === Number(itemId)
    );

    function handleItemChange(value) {
        setItemId(value);
        setBatchId("");
    }

    async function handleCreateTransfer(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            await createTransfer({
                transferNumber,
                sourceLocationId: Number(sourceLocationId),
                destinationLocationId: Number(destinationLocationId),
                itemId: Number(itemId),
                batchId: Number(batchId),
                quantity: Number(quantity)
            });

            setSuccess("Transfer request created successfully.");

            setTransferNumber("");
            setSourceLocationId("");
            setDestinationLocationId("");
            setItemId("");
            setBatchId("");
            setQuantity("");

            await loadTransfers();

        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDispatch(id) {
        setError("");
        setSuccess("");
        setActionId(id);

        try {
            await dispatchTransfer(id);

            setSuccess("Transfer dispatched successfully.");

            await loadTransfers();

        } catch (error) {
            setError(error.message);
        } finally {
            setActionId(null);
        }
    }

    async function handleReceive(id) {
        setError("");
        setSuccess("");
        setActionId(id);

        try {
            await receiveTransfer(id);

            setSuccess("Transfer received successfully.");

            await loadTransfers();

        } catch (error) {
            setError(error.message);
        } finally {
            setActionId(null);
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
                    <Link to="/inventory">Inventory</Link>
                    <Link to="/work-orders">Work Orders</Link>
                    <Link to="/transfers">Transfers</Link>
                    <Link to="/orders">Orders</Link>
                </nav>
            </header>

            <main
                style={{
                    maxWidth: "1300px",
                    margin: "0 auto",
                    padding: "32px"
                }}
            >
                <div style={{ marginBottom: "24px" }}>
                    <h1
                        style={{
                            margin: "0 0 6px",
                            fontSize: "26px"
                        }}
                    >
                        Internal Transfers
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#64748b"
                        }}
                    >
                        Request, dispatch and receive stock transfers.
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
                        Create Transfer
                    </h3>

                    <form onSubmit={handleCreateTransfer}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, 1fr)",
                                gap: "16px"
                            }}
                        >
                            <div>
                                <label>Transfer ID</label>

                                <input
                                    value={transferNumber}
                                    onChange={(e) =>
                                        setTransferNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="TRF-001"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label>Source Location</label>

                                <select
                                    value={sourceLocationId}
                                    onChange={(e) =>
                                        setSourceLocationId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">
                                        Select source
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
                                <label>Destination Location</label>

                                <select
                                    value={destinationLocationId}
                                    onChange={(e) =>
                                        setDestinationLocationId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">
                                        Select destination
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
                                <label>Item</label>

                                <select
                                    value={itemId}
                                    onChange={(e) =>
                                        handleItemChange(
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
                                <label>Batch</label>

                                <select
                                    value={batchId}
                                    onChange={(e) =>
                                        setBatchId(e.target.value)
                                    }
                                    required
                                    disabled={!itemId}
                                    style={inputStyle}
                                >
                                    <option value="">
                                        Select batch
                                    </option>

                                    {filteredBatches.map((batch) => (
                                        <option
                                            key={batch.id}
                                            value={batch.id}
                                        >
                                            {batch.batch_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label>Quantity</label>

                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
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
                                : "Create Transfer"}
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
                            Transfer History
                        </h3>
                    </div>

                    {loading ? (
                        <p
                            style={{
                                padding: "24px",
                                color: "#64748b"
                            }}
                        >
                            Loading transfers...
                        </p>
                    ) : transfers.length === 0 ? (
                        <p
                            style={{
                                padding: "24px",
                                color: "#64748b"
                            }}
                        >
                            No transfers found.
                        </p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
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
                                            Transfer
                                        </th>
                                        <th style={thStyle}>
                                            Source
                                        </th>
                                        <th style={thStyle}>
                                            Destination
                                        </th>
                                        <th style={thStyle}>
                                            Item
                                        </th>
                                        <th style={thStyle}>
                                            Batch
                                        </th>
                                        <th style={thStyle}>
                                            Quantity
                                        </th>
                                        <th style={thStyle}>
                                            Status
                                        </th>
                                        <th style={thStyle}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transfers.map((transfer) => (
                                        <tr key={transfer.id}>
                                            <td style={tdStyle}>
                                                {
                                                    transfer.transfer_number
                                                }
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

                                            <td style={tdStyle}>
                                                {transfer.quantity}
                                            </td>

                                            <td style={tdStyle}>
                                                <span
                                                    style={{
                                                        padding:
                                                            "4px 8px",
                                                        borderRadius:
                                                            "4px",
                                                        fontSize:
                                                            "12px",
                                                        background:
                                                            "#f1f5f9"
                                                    }}
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
                                                        onClick={() =>
                                                            handleDispatch(
                                                                transfer.id
                                                            )
                                                        }
                                                        disabled={
                                                            actionId ===
                                                            transfer.id
                                                        }
                                                        style={
                                                            actionButtonStyle
                                                        }
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
                                                        onClick={() =>
                                                            handleReceive(
                                                                transfer.id
                                                            )
                                                        }
                                                        disabled={
                                                            actionId ===
                                                            transfer.id
                                                        }
                                                        style={
                                                            actionButtonStyle
                                                        }
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
                                                        style={{
                                                            color: "#64748b"
                                                        }}
                                                    >
                                                        Completed
                                                    </span>
                                                )}
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

const actionButtonStyle = {
    padding: "7px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: "13px"
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

export default Transfers;