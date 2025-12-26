const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 20) {
    // keep it strict so you don't accidentally deploy with a weak secret
    throw new Error("Missing/weak JWT_SECRET (set it in Function App settings; min 20 chars).");
  }
  return secret;
}

function signToken({ userId, email, roles }) {
  const secret = getJwtSecret();

  // 7 days expiry for coursework demo (change if you want)
  const payload = { sub: userId, email, roles };
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

function readBearerToken(request) {
  const auth = request.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function requireJwtAuth(request) {
  try {
    const token = readBearerToken(request);
    if (!token) return { ok: false, status: 401, error: "Missing Bearer token" };

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    return {
      ok: true,
      userId: decoded.sub || null,
      email: decoded.email || null,
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      token: decoded,
    };
  } catch (e) {
    return { ok: false, status: 401, error: "Invalid or expired token" };
  }
}

function requireJwtRole(request, role) {
  const auth = requireJwtAuth(request);
  if (!auth.ok) return auth;

  if (!auth.roles.includes(role)) {
    return { ok: false, status: 403, error: `Requires role: ${role}` };
  }
  return auth;
}

module.exports = { signToken, requireJwtAuth, requireJwtRole };
