const { getContainer } = require("../src/cosmosClient");

module.exports = async function (context, req) {
  try {
    // Simple optional DB ping (helps verify Cosmos connection)
    // This reads the container metadata; low cost and fast.
    await getContainer("mediaItems");

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        ok: true,
        service: "media-mini-api",
        time: new Date().toISOString()
      }
    };
  } catch (err) {
    context.log.error("Health check failed:", err);

    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        ok: false,
        error: err.message
      }
    };
  }
};
