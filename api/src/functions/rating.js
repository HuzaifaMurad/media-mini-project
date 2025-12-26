const { app } = require("@azure/functions");
const { getContainer } = require("../cosmosClient");
// const { requireAuth } = require("../auth");
const { requireJwtAuth } = require("../jwtAuth");


// PUT /api/media/{id}/rating  body: { "value": 1..5 }
app.http("setRating", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "media/{id}/rating",
    handler: async (request, context) => {
        try {
            // const guard = requireAuth(request);
            const guard = requireJwtAuth(request);

            if (!guard.ok) return { status: guard.status, jsonBody: { ok: false, error: guard.error } };
            const userId = guard.userId;
            const mediaId = request.params.id;
            if (!mediaId) return { status: 400, jsonBody: { ok: false, error: "media id is required" } };

            const body = await request.json();
            const value = Number(body.value);

            if (!Number.isInteger(value) || value < 1 || value > 5) {
                return { status: 400, jsonBody: { ok: false, error: "value must be an integer from 1 to 5" } };
            }

            //  const userId = "consumer_demo"; // later: from auth token
            const ratings = await getContainer("ratings");

            // One rating per (mediaId,userId) => deterministic id
            const id = `rate_${mediaId}_${userId}`;

            const doc = {
                id,
                mediaId,
                userId,
                value,
                createdAt: new Date().toISOString()
            };

            // upsert = insert or update
            await ratings.items.upsert(doc);

            return { status: 200, jsonBody: { ok: true } };
        } catch (err) {
            context.error("setRating error:", err);
            return { status: 500, jsonBody: { ok: false, error: err.message } };
        }
    }
});

// GET /api/media/{id}/rating/summary
app.http("ratingSummary", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "media/{id}/rating/summary",
    handler: async (request, context) => {
        try {
            const mediaId = request.params.id;
            if (!mediaId) return { status: 400, jsonBody: { ok: false, error: "media id is required" } };

            const ratings = await getContainer("ratings");

            // Beginner-friendly approach:
            // fetch ratings for this mediaId and compute avg in code
            // const sql = "SELECT c.value FROM c WHERE c.mediaId = @mediaId";
            const sql = "SELECT * FROM c WHERE c.mediaId = @mediaId";
            const params = [{ name: "@mediaId", value: mediaId }];

            const { resources } = await ratings.items.query({ query: sql, parameters: params }).fetchAll();

            const count = resources.length;
            const sum = resources.reduce((acc, r) => acc + Number(r.value || 0), 0);
            const avg = count === 0 ? 0 : Math.round((sum / count) * 10) / 10; // 1 decimal

            return { status: 200, jsonBody: { ok: true, avg, count } };
        } catch (err) {
            context.error("ratingSummary error:", err);
            return { status: 500, jsonBody: { ok: false, error: err.message } };
        }
    }
});
