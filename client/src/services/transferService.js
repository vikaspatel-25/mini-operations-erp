import API_URL from "./api";

export async function getTransferData() {
    const response = await fetch(`${API_URL}/transfers`, {
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch transfers"
        );
    }

    return data;
}

export async function createTransfer(transfer) {
    const response = await fetch(`${API_URL}/transfers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(transfer)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create transfer"
        );
    }

    return data;
}

export async function dispatchTransfer(transferId) {
    const response = await fetch(
        `${API_URL}/transfers/${transferId}/dispatch`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to dispatch transfer"
        );
    }

    return data;
}

export async function receiveTransfer(transferId) {
    const response = await fetch(
        `${API_URL}/transfers/${transferId}/receive`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to receive transfer"
        );
    }

    return data;
}