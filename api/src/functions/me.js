const { app } = require("@azure/functions");
const { getUserId, getRoles } = require("../auth");

app.http("me", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "me",
  handler: async (request) => {
    const userId = getUserId(request);
    const roles = getRoles(request);

    return {
      status: 200,
      jsonBody: {
        ok: true,
        isAuthenticated: !!userId,
        userId: userId || null,
        roles: roles || []
      }
    };
  }
});
