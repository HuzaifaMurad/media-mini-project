const { app } = require("@azure/functions");
const { signToken } = require("../jwtAuth");

function parseJsonBodySafe(request) {
  return request.json().catch(() => ({}));
}

function normalizeEmail(s) {
  return String(s || "").trim().toLowerCase();
}

function getCreatorAllowList() {
  const raw = process.env.CREATOR_EMAILS || "";
  return raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

// POST /api/auth/login  body: { "email": "..." }
app.http("authLogin", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: async (request, context) => {
    try {
      const body = await parseJsonBodySafe(request);
      const email = normalizeEmail(body.email);

      if (!email || !email.includes("@")) {
        return { status: 400, jsonBody: { ok: false, error: "Valid email is required" } };
      }

      const creators = getCreatorAllowList();
      const roles = creators.includes(email) ? ["Creator"] : ["Consumer"];

      // userId can just be email for coursework
      const token = signToken({ userId: email, email, roles });

      return {
        status: 200,
        jsonBody: {
          ok: true,
          token,
          user: { userId: email, email, roles },
        },
      };
    } catch (err) {
      context.error("authLogin error:", err);
      return { status: 500, jsonBody: { ok: false, error: err.message } };
    }
  },
});
