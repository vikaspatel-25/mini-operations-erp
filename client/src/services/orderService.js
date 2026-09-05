import API_URL from "./api";

export async function getOrderData() {
    const response = await fetch(`${API_URL}/orders`, {
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch orders"
        );
    }

    return data;
}

export async function createOrder(order) {
    const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(order)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create order"
        );
    }

    return data;
}