function getClientPrincipal(request) {
  // Easy Auth injects this header as Base64 JSON
  const header = request.headers.get("x-ms-client-principal");
  if (!header) return null;

  const decoded = Buffer.from(header, "base64").toString("utf8");
  return JSON.parse(decoded);
}

function getUserId(request) {
  const cp = getClientPrincipal(request);
  // userId is usually present; if not, fall back to name
  return cp?.userId || cp?.userDetails || null;
}

function getRoles(request) {
  const cp = getClientPrincipal(request);
  const claims = cp?.claims || [];
  // roles might appear as "roles" claim (app roles)
  const roles = claims
    .filter(c => c.typ === "roles" || c.typ === "role")
    .map(c => c.val);
  return roles;
}

function requireAuth(request) {
  const userId = getUserId(request);
  if (!userId) {
    return { ok: false, status: 401, error: "Authentication required" };
  }
  return { ok: true, userId };
}

function requireRole(request, requiredRole) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth;

  const roles = getRoles(request);
  if (!roles.includes(requiredRole)) {
    return { ok: false, status: 403, error: `Requires role: ${requiredRole}` };
  }
  return { ok: true, userId: auth.userId, roles };
}

module.exports = { getClientPrincipal, getUserId, getRoles, requireAuth, requireRole };
