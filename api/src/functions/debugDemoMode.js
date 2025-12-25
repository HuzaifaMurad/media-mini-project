const { app } = require("@azure/functions");

app.http("debugDemoMode", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "debug/demo",
  handler: async (req) => {
    return {
      status: 200,
      jsonBody: {
        DEMO_MODE: process.env.DEMO_MODE || null
      }
    };
  }
});
