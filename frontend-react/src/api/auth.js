import axios from "axios";

export async function fetchSwaMe() {
  // Works when deployed on SWA or when using SWA CLI locally.
  const res = await axios.get("/.auth/me", { withCredentials: true });
  const cp = res.data?.clientPrincipal || null;

  if (!cp) return { isAuthenticated: false, roles: [], userId: null, userDetails: null };

  const roles = cp.userRoles || [];
  const isAuthenticated = !roles.includes("anonymous");

  return {
    isAuthenticated,
    roles,
    userId: cp.userId || null,
    userDetails: cp.userDetails || null,
  };
}

export function login() {
  window.location.href = "/.auth/login/aad";
}
export function logout() {
  window.location.href = "/.auth/logout";
}
