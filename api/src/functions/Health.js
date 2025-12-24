const { app } = require("@azure/functions");
const { getContainer } = require("../cosmosClient");

app.http("Health", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      await getContainer("mediaItems");

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: true,
          service: "media-mini-api",
          time: new Date().toISOString(),
        }),
      };
    } catch (err) {
      context.error("Health check failed:", err);

      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error: err.message,
        }),
      };
    }
  },
});
