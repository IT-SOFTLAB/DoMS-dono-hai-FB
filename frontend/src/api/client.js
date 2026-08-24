export const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("doms_token");
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
    localStorage.removeItem("doms_token");
    localStorage.removeItem("doms_user");
  }
  if (!response.ok) {
    let message;
    try { message = JSON.parse(text).message; } catch { message = text; }
    throw new Error(message || "Request failed");
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}
