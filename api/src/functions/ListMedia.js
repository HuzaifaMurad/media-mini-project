const { app } = require("@azure/functions");
const { getContainer } = require("../cosmosClient");
const { json } = require("../utils");

app.http("ListMedia", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "media",
  handler: async (request, context) => {
    try {
      const container = await getContainer("mediaItems");
      const url = new URL(request.url);

      const query = (url.searchParams.get("query") || "").trim().toLowerCase();
      const includeDrafts = url.searchParams.get("includeDrafts") === "true";

      const skip = Math.max(parseInt(url.searchParams.get("skip") || "0", 10), 0);
      const take = Math.min(Math.max(parseInt(url.searchParams.get("take") || "20", 10), 1), 50);

      let sql = "SELECT * FROM c WHERE c.pk = @pk";
      const params = [{ name: "@pk", value: "MEDIA" }];

      // ✅ Consumer-safe: hide drafts by default
      if (!includeDrafts) {
        sql += " AND c.status = @status";
        params.push({ name: "@status", value: "active" });
      }

      // ✅ Search title/caption/location + people[]
      if (query) {
        sql +=
          " AND (" +
          "CONTAINS(LOWER(c.title), @q) " +
          "OR CONTAINS(LOWER(c.caption), @q) " +
          "OR CONTAINS(LOWER(c.location), @q) " +
          "OR EXISTS(SELECT VALUE p FROM p IN c.people WHERE CONTAINS(LOWER(p), @q))" +
          ")";
        params.push({ name: "@q", value: query });
      }

      sql += " ORDER BY c.createdAt DESC OFFSET @skip LIMIT @take";
      params.push({ name: "@skip", value: skip });
      params.push({ name: "@take", value: take });

      const { resources } = await container.items
        .query({ query: sql, parameters: params })
        .fetchAll();

      return json(200, {
        ok: true,
        items: resources,
        next: { skip: skip + take, take },
      });
    } catch (err) {
      context.error("ListMedia error:", err);
      return json(500, { ok: false, error: err.message });
    }
  },
});
