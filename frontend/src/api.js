import axios from 'axios';
import {ACCESS_TOKEN, REFRESH_TOKEN} from './constants.js'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem(REFRESH_TOKEN);
                if (!refresh) throw error;

                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, { refresh });
                const newAccess = res.data.access;

                localStorage.setItem(ACCESS_TOKEN, newAccess);
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;

                return api(originalRequest);
            } catch (refreshErr) {
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
            }
        }

        return Promise.reject(error);
    }
);

export default api

// --- Lost & Found: list items (supports pagination + filters) ---
export async function getItems({ page = 1, limit = 18, status, mine = false } = {}) {
  // Example backend route: /api/items?page=1&limit=18&status=lost&owner=me
  const params = { page, limit };
  if (status) params.status = status;      // "lost" | "found"
  if (mine) params.owner = "me";           // server interprets as current user

  const res = await api.get("/api/items", { params });

  // normalize a bit for the UI
  const data = res.data || {};
  const raw = data.results || data.items || [];
  const items = raw.map((it) => ({
    id: it.id ?? it._id,
    title: it.title ?? it.name ?? "Untitled",
    image: it.image ?? it.photo ?? (it.images && it.images[0]) ?? "",
    location: it.location ?? it.place ?? "—",
    status: it.status ?? it.state ?? "unknown",
    createdAt: it.created_at ?? it.createdAt ?? it.date ?? null,
  }));

  const hasMore =
    typeof data.next === "boolean"
      ? data.next
      : data.count
      ? page * (limit || 18) < data.count
      : items.length > 0; // best-effort fallback

  return { items, hasMore, count: data.count ?? items.length };
}

// --- Create Lost & Found item ---
// Accepts either a plain object OR a FormData (if you have a file).
export async function createItem(payload) {
  // Endpoint name may differ in your backend:
  // e.g. /api/items, /api/posts, /lost-found/items
  const url = "/api/items";

  // Decide whether to send multipart/form-data if there is a File
  const hasFile =
    payload instanceof FormData ||
    Object.values(payload || {}).some(v => v instanceof File);

  let body;
  let headers = {};

  if (hasFile) {
    // Build FormData if not already provided
    if (!(payload instanceof FormData)) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      body = fd;
    } else {
      body = payload;
    }
    // do NOT set Content-Type; browser will set multipart boundary
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }

  // If you attach auth tokens somewhere (like an axios instance),
  // and you already have `api`, you can just do:
  // return (await api.post(url, body)).data;

  // Using fetch to be self-contained:
  const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";
  const res = await fetch(base + url, {
    method: "POST",
    headers,
    body,
    credentials: "include", // optional, keep if your API needs cookies/session
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create item failed (${res.status}): ${text}`);
  }
  return await res.json();
}
