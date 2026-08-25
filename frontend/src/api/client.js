export const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

let pendingRequests = 0;
const inFlightGets = new Map();
const storage = window.sessionStorage;
function reportPending(delta) {
  pendingRequests = Math.max(0, pendingRequests + delta);
  window.dispatchEvent(new CustomEvent("doms:pending", { detail: pendingRequests }));
}

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const requestKey = method === "GET" ? path : null;
  if (requestKey && inFlightGets.has(requestKey)) return inFlightGets.get(requestKey);

  const request = executeApi(path, options);
  if (requestKey) inFlightGets.set(requestKey, request);
  try { return await request; }
  finally { if (requestKey) inFlightGets.delete(requestKey); }
}

async function executeApi(path, options) {
  const token = storage.getItem("doms_token");
  reportPending(1);
  try {
    const response = await fetch(API + path, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const text = await response.text();
    if (response.status === 401) {
      clearSession();
      window.dispatchEvent(new Event("doms:unauthorized"));
    }
    if (!response.ok) {
      let message;
      try { message = JSON.parse(text).message; } catch { message = text; }
      throw new Error(message || "Request failed");
    }
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  } finally {
    reportPending(-1);
  }
}

export async function apiBlob(path) {
  const token = storage.getItem("doms_token");
  reportPending(1);
  try {
    const response = await fetch(API + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (response.status === 401) {
      clearSession();
      window.dispatchEvent(new Event("doms:unauthorized"));
    }
    if (!response.ok) {
      let message = "File could not be loaded";
      try { message = (await response.json()).message || message; } catch { /* non-JSON response */ }
      throw new Error(message);
    }
    return response.blob();
  } finally {
    reportPending(-1);
  }
}

export function saveSession(user) {
  storage.setItem("doms_token", user.token);
  storage.setItem("doms_user", JSON.stringify(user));
}

export function readSession() {
  try {
    const user = JSON.parse(storage.getItem("doms_user"));
    return user?.token && user?.role ? user : null;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  storage.removeItem("doms_token");
  storage.removeItem("doms_user");
  // Remove credentials created by older builds so they cannot silently restore a session.
  localStorage.removeItem("doms_token");
  localStorage.removeItem("doms_user");
}
