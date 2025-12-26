const { app } = require("@azure/functions");
const { requireJwtAuth } = require("../jwtAuth");

// GET /api/auth/me
app.http("authMe", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "auth/me",
  handler: async (request) => {
    const auth = requireJwtAuth(request);
    if (!auth.ok) return { status: auth.status, jsonBody: { ok: false, error: auth.error } };

    return {
      status: 200,
      jsonBody: {
        ok: true,
        isAuthenticated: true,
        userId: auth.userId,
        email: auth.email,
        roles: auth.roles,
      },
    };
  },
});
