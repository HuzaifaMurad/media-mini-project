function getClientPrincipal(request) {
  // Easy Auth injects this header as Base64 JSON
  const header = request.headers.get("x-ms-client-principal");
  if (!header) return null;

  const decoded = Buffer.from(header, "base64").toString("utf8");
  return JSON.parse(decoded);
}

// function getUserId(request) {
//   const cp = getClientPrincipal(request);
//   // userId is usually present; if not, fall back to name
//   return cp?.userId || cp?.userDetails || null;
// }

function getUserId(request) {
  const cp = getClientPrincipal(request);
  if (!cp) return null;

  // Try the usual fields first
  if (cp.userId) return cp.userId;
  if (cp.userDetails) return cp.userDetails;

  // Fallback: search common claim types
  const claims = cp.claims || [];
  const claimTypesToTry = [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "preferred_username",
    "name",
    "upn",
    "email"
  ];

  for (const t of claimTypesToTry) {
    const found = claims.find(c => c.typ === t);
    if (found?.val) return found.val;
  }

  return null;
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
  // ✅ Local development bypass
  if (process.env.LOCAL_DEV_BYPASS_AUTH === "true") {
    return { ok: true, userId: "local_user" };
  }

  const userId = getUserId(request);
  if (!userId) {
    return { ok: false, status: 401, error: "Authentication required" };
  }
  return { ok: true, userId };
}

function requireRole(request, requiredRole) {
   if (process.env.DEMO_MODE === "true") {
    const demoUser = request.headers.get("x-demo-user");
    const demoRolesRaw = request.headers.get("x-demo-roles") || "";
    const demoRoles = demoRolesRaw.split(",").map(s => s.trim());

    if (demoUser && demoRoles.includes(requiredRole)) {
      return { ok: true, userId: demoUser, roles: demoRoles };
    }
  }

  // ✅ Local development bypass
  if (process.env.LOCAL_DEV_BYPASS_AUTH === "true") {
    return { ok: true, userId: "local_user", roles: [requiredRole] };
  }

  const auth = requireAuth(request);
  if (!auth.ok) return auth;

  const roles = getRoles(request);
  if (!roles.includes(requiredRole)) {
    return { ok: false, status: 403, error: `Requires role: ${requiredRole}` };
  }
  return { ok: true, userId: auth.userId, roles };
}


module.exports = { getClientPrincipal, getUserId, getRoles, requireAuth, requireRole };
