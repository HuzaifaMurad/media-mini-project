const { app } = require("@azure/functions");
const { getContainer } = require("../cosmosClient");
const crypto = require("crypto");
//const { requireAuth } = require("../auth");
const { requireJwtAuth } = require("../jwtAuth");


function makeId(prefix) {
    return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

// POST /api/media/{id}/comments
app.http("addComment", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "media/{id}/comments",
    handler: async (request, context) => {
        try {
          //  const guard = requireAuth(request);
          const guard = requireJwtAuth(request);

            if (!guard.ok) return { status: guard.status, jsonBody: { ok: false, error: guard.error } };
            const userId = guard.userId;

            const mediaId = request.params.id;
            if (!mediaId) return { status: 400, jsonBody: { ok: false, error: "media id is required" } };

            const body = await request.json();
            const text = (body.text || "").trim();
            if (!text) return { status: 400, jsonBody: { ok: false, error: "text is required" } };
            if (text.length > 500) return { status: 400, jsonBody: { ok: false, error: "comment too long (max 500)" } };

         //   const userId = "consumer_demo"; // later: from auth token
            const doc = {
                id: makeId("cmt"),
                mediaId,
                userId,
                text,
                createdAt: new Date().toISOString()
            };

            const comments = await getContainer("comments");
            await comments.items.create(doc);

            return { status: 201, jsonBody: { ok: true, item: doc } };
        } catch (err) {
            context.error("addComment error:", err);
            return { status: 500, jsonBody: { ok: false, error: err.message } };
        }
    }
});

// GET /api/media/{id}/comments?skip=0&take=50
app.http("listComments", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "media/{id}/comments",
    handler: async (request, context) => {
        try {
            const mediaId = request.params.id;
            if (!mediaId) return { status: 400, jsonBody: { ok: false, error: "media id is required" } };

            const url = new URL(request.url);
            const skip = Math.max(parseInt(url.searchParams.get("skip") || "0", 10), 0);
            const take = Math.min(Math.max(parseInt(url.searchParams.get("take") || "50", 10), 1), 100);

            const comments = await getContainer("comments");

            const sql =
                "SELECT * FROM c WHERE c.mediaId = @mediaId ORDER BY c.createdAt DESC OFFSET @skip LIMIT @take";
            const params = [
                { name: "@mediaId", value: mediaId },
                { name: "@skip", value: skip },
                { name: "@take", value: take }
            ];

            const { resources } = await comments.items.query({ query: sql, parameters: params }).fetchAll();

            return {
                status: 200,
                jsonBody: { ok: true, items: resources, next: { skip: skip + take, take } }
            };
        } catch (err) {
            context.error("listComments error:", err);
            return { status: 500, jsonBody: { ok: false, error: err.message } };
        }
    }
});
