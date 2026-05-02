const BASE_URL = "http://localhost:5000";

export async function getIncidents() {
  const res = await fetch(`${BASE_URL}/incidents`);
  return res.json();
}

export async function addRCA(id, data) {
  await fetch(`${BASE_URL}/rca/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function updateStatus(id, status) {
  await fetch(`${BASE_URL}/incident/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
}