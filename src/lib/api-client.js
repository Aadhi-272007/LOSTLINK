import { getAccessToken } from "@base44/sdk";

/** JSON call to one of the board's data routes, carrying the visitor's token when signed in. */
export async function apiFetch(url, { method = "GET", body } = {}) {
  const token = getAccessToken();
  const response = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload?.error ?? "Request failed"), { status: response.status });
  }
  return payload;
}