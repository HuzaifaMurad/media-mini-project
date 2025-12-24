const { app } = require("@azure/functions");
const { getContainer } = require("../cosmosClient");

// If you already have src/utils.js, import it.
// If not, I’ll give you a quick utils file below.
const { json, makeId, nowIso } = require("../utils");

app.http("CreateMedia", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "media",
  handler: async (request, context) => {
    try {
      const body = await request.json().catch(() => ({}));

      const title = (body.title || "").trim();
      const caption = (body.caption || "").trim();
      const location = (body.location || "").trim();
      const people = Array.isArray(body.people)
        ? body.people.map((p) => String(p).trim()).filter(Boolean)
        : [];

      const fileName = (body.fileName || "").trim();
      const contentType = (body.contentType || "").trim();

      if (!title) return json(400, { ok: false, error: "title is required" });
      if (!fileName) return json(400, { ok: false, error: "fileName is required" });
      if (!contentType.startsWith("image/")) {
        return json(400, {
          ok: false,
          error: "Only image uploads are supported (contentType must start with image/)",
        });
      }

      const creatorId = "creator_demo";

      const id = makeId("media");
      const ext = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
      const blobName = `${id}.${ext}`;

      const storageAccount = process.env.STORAGE_ACCOUNT_NAME || "<storage-account>";
      const blobUrl = `https://${storageAccount}.blob.core.windows.net/media/${blobName}`;

      const doc = {
        id,
        pk: "MEDIA",
        creatorId,
        title,
        caption,
        location,
        people,
        blobUrl,
        thumbnailUrl: null,
        createdAt: nowIso(),
        status: "draft",
      };

      const container = await getContainer("mediaItems");
      await container.items.create(doc);

      return json(201, {
        ok: true,
        item: doc,
        upload: { blobName, blobUrl },
      });
    } catch (err) {
      context.error("CreateMedia error:", err);
      return json(500, { ok: false, error: err.message });
    }
  },
});
