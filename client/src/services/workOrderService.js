import API_URL from "./api";

export async function getWorkOrderData() {
    const response = await fetch(`${API_URL}/work-orders`, {
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch work orders"
        );
    }

    return data;
}


export async function createWorkOrder(workOrder) {
    const response = await fetch(`${API_URL}/work-orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(workOrder)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create work order"
        );
    }

    return data;
}