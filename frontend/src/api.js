import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors & refresh token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem(REFRESH_TOKEN);
        if (!refresh) throw error;

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
          { refresh }
        );
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

export default api;

// -------------------- LOST & FOUND FUNCTIONS --------------------

// Fetch posts (lost/found)
export async function getItems({ page = 1, limit = 18, status, mine = false } = {}) {
  const params = { page, limit };
  if (status) params.status = status; // "lost" or "found"
  if (mine) params.owner = "me";

  const res = await api.get("/api/posts/", { params });
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
      : items.length > 0;

  return { items, hasMore, count: data.count ?? items.length };
}

// Create a new post (lost/found)
// Create a new post (lost/found) via DRF router at /api/posts/
export async function createItem(payload) {
  const url = "/api/posts/"; // matches router.register('posts', ...)

  const hasFile =
    payload instanceof FormData ||
    Object.values(payload || {}).some(v => v instanceof File);

  let body = payload;
  let headers = {};

  if (hasFile) {
    if (!(payload instanceof FormData)) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      body = fd;
    }
    headers["Content-Type"] = "multipart/form-data"; // let browser set boundary
  } else {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await api.post(url, body, { headers }); // <-- uses axios baseURL
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    let detail =
      (data && (data.detail || data.error || data.message)) ||
      (typeof data === "string" ? data : "");
    if (!detail && data && typeof data === "object") {
      const k = Object.keys(data)[0];
      const v = data[k];
      if (Array.isArray(v) && v.length) detail = `${k}: ${v[0]}`;
    }
    throw new Error(detail || `Create item failed (${status ?? "network"})`);
  }
}
