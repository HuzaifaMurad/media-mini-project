const { app } = require("@azure/functions");
const { getClientPrincipal, getUserId, getRoles } = require("../auth");

app.http("me", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "me",
  handler: async (request) => {
    const cp = getClientPrincipal(request);
    const roles = getRoles(request) || [];
    const userId = getUserId(request);

    // ✅ Auth is true if a principal exists OR roles exist
    const isAuthenticated = !!cp || roles.length > 0;

    return {
      status: 200,
      jsonBody: {
        ok: true,
        isAuthenticated,
        userId: userId || null,
        roles
      }
    };
  }
});
