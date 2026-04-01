// Detect if build is production or development
const isProduction = import.meta.env.MODE === "production";

// Your active ngrok backend URL
const NGROK_URL = "https://7pkhvg3q-5000.inc1.devtunnels.ms";

/**
 * MAIN BACKEND URLS
 * (Keep BASE_URLS so your existing imports don't break)
 */
export const BASE_URLS = {
  user: NGROK_URL,
  admin: NGROK_URL,
};

// Unified base URL used by all requests
export const BASE_URL = BASE_URLS.user;


// ==================================================
// 📡 API FETCH WRAPPER (FIXED FOR NGROK)
// ==================================================
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    mode: "cors",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Host": "leeann-symbolistical-unpreternaturally.ngrok-free.dev",   // 🔥 FIX 1
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  // Read raw response text
  const raw = await res.text();

  // 🔥 FIX 2 — Detect ngrok HTML error
  if (raw.startsWith("<!DOCTYPE html>")) {
    console.error("❌ Ngrok ERROR page returned instead of JSON");
    console.error(raw);
    throw new Error("Ngrok returned HTML error page. Backend not reached.");
  }

  // Try to parse JSON
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      raw ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data ?? null;
}


// ==================================================
// 🌐 API METHOD HELPERS
// ==================================================
export function apiGet(path) {
  return apiFetch(path, { method: "GET" });
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function apiPut(path, body) {
  return apiFetch(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return apiFetch(path, { method: "DELETE" });
}