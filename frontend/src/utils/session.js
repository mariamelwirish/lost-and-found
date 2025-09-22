// src/utils/session.js
export const USER_KEY = "lf_user";

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
}
