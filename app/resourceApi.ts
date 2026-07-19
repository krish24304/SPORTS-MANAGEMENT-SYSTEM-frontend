const API = "http://localhost:5000";

export async function createResources(data: {
    sportId: number;
    resourceType: string;
    quantity: number;
}) {
    const res = await fetch(`${API}/sports/${data.sportId}/resource-units`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create resources");

    return res.json();
}

export async function renameResourceUnit(
    id: number,
    name: string
) {
    const res = await fetch(`${API}/resource-units/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("Rename failed");

    return res.json();
}

export async function deleteResourceUnit(id: number) {
    const res = await fetch(`${API}/resource-units/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) throw new Error("Delete failed");
}