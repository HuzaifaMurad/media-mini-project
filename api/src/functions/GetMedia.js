const { app } = require("@azure/functions");
const { getContainer } = require("../cosmosClient");
const { json } = require("../utils");

app.http("GetMedia", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "media/{id}",
  handler: async (request, context) => {
    try {
      const id = request.params?.id;
      if (!id) return json(400, { ok: false, error: "id is required" });

      const container = await getContainer("mediaItems");

      // pk for all media docs is "MEDIA"
      const { resource } = await container.item(id, "MEDIA").read();

      if (!resource) return json(404, { ok: false, error: "media not found" });

      return json(200, { ok: true, item: resource });
    } catch (err) {
      context.error("GetMedia error:", err);
      return json(500, { ok: false, error: err.message });
    }
  },
});
