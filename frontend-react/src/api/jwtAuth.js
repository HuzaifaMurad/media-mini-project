import { api } from "./client";

const TOKEN_KEY = "mm_jwt";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function jwtLogin(email) {
  const res = await api.post("/auth/login", { email });
  if (!res.data?.ok) throw new Error(res.data?.error || "Login failed");
  setToken(res.data.token);
  return res.data.user;
}

export async function jwtMe() {
  const res = await api.get("/auth/me");
  if (!res.data?.ok) return { isAuthenticated: false, roles: [], userId: null, email: null };
  return res.data;
}
