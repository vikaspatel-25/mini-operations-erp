import API_URL from "./api";

export async function getInventory() {
    const response = await fetch(`${API_URL}/inventory`, {
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch inventory");
    }

    return data;
}

export async function adjustInventory(
    inventoryId,
    quantity,
    transactionId
) {
    const response = await fetch(`${API_URL}/inventory/adjust`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            inventoryId,
            quantity,
            transactionId
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to adjust inventory");
    }

    return data;
}