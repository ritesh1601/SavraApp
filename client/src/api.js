const BASE = import.meta.env.VITE_API_BASE;

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "API error");
  return json.data;
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "API error");
  return json;
}
