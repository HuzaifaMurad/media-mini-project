// const { app } = require("@azure/functions");
// const { getContainer } = require("../cosmosClient");

// // If you already have src/utils.js, import it.
// // If not, I’ll give you a quick utils file below.
// const { json, makeId, nowIso } = require("../utils");

// app.http("CreateMedia", {
//   methods: ["POST"],
//   authLevel: "anonymous",
//   route: "media",
//   handler: async (request, context) => {
//     try {
//       const body = await request.json().catch(() => ({}));

//       const title = (body.title || "").trim();
//       const caption = (body.caption || "").trim();
//       const location = (body.location || "").trim();
//       const people = Array.isArray(body.people)
//         ? body.people.map((p) => String(p).trim()).filter(Boolean)
//         : [];

//       const fileName = (body.fileName || "").trim();
//       const contentType = (body.contentType || "").trim();

//       if (!title) return json(400, { ok: false, error: "title is required" });
//       if (!fileName) return json(400, { ok: false, error: "fileName is required" });
//       if (!contentType.startsWith("image/")) {
//         return json(400, {
//           ok: false,
//           error: "Only image uploads are supported (contentType must start with image/)",
//         });
//       }

//       const creatorId = "creator_demo";

//       const id = makeId("media");
//       const ext = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
//       const blobName = `${id}.${ext}`;

//       const storageAccount = process.env.STORAGE_ACCOUNT_NAME || "<storage-account>";
//       const blobUrl = `https://${storageAccount}.blob.core.windows.net/media/${blobName}`;

//       const doc = {
//         id,
//         pk: "MEDIA",
//         creatorId,
//         title,
//         caption,
//         location,
//         people,
//         blobUrl,
//         thumbnailUrl: null,
//         createdAt: nowIso(),
//         status: "draft",
//       };

//       const container = await getContainer("mediaItems");
//       await container.items.create(doc);

//       return json(201, {
//         ok: true,
//         item: doc,
//         upload: { blobName, blobUrl },
//       });
//     } catch (err) {
//       context.error("CreateMedia error:", err);
//       return json(500, { ok: false, error: err.message });
//     }
//   },
// });


const { app } = require("@azure/functions");
const { makeUploadSasUrl } = require("../sas");
const { getContainer } = require("../cosmosClient"); // reuse your existing helper
const crypto = require("crypto");
// const { requireRole } = require("../auth");
const { requireJwtRole } = require("../jwtAuth");



function makeId(prefix) {
    return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

app.http("createMedia", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "media",
    handler: async (request, context) => {
        try {
            // const guard = requireRole(request, "Creator");
            const guard = requireJwtRole(request, "Creator");
            if (!guard.ok) return { status: guard.status, jsonBody: { ok: false, error: guard.error } };
            const creatorId = guard.userId;
            const body = await request.json();

            const title = (body.title || "").trim();
            const caption = (body.caption || "").trim();
            const location = (body.location || "").trim();
            const people = Array.isArray(body.people)
                ? body.people.map(p => String(p).trim()).filter(Boolean)
                : [];

            const fileName = (body.fileName || "").trim();
            const contentType = (body.contentType || "").trim();

            if (!title) return { status: 400, jsonBody: { ok: false, error: "title is required" } };
            if (!fileName) return { status: 400, jsonBody: { ok: false, error: "fileName is required" } };
            if (!contentType.startsWith("image/")) {
                return { status: 400, jsonBody: { ok: false, error: "Only image uploads are supported (contentType must start with image/)" } };
            }

          //  const creatorId = "creator_demo"; // Step 11+ we’ll replace with real auth user

            const id = makeId("media");
            const ext = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
            const blobName = `${id}.${ext}`;

            const containerName = process.env.STORAGE_CONTAINER_NAME || "media";
            const upload = makeUploadSasUrl(containerName, blobName, contentType);

            const doc = {
                id,
                pk: "MEDIA",
                creatorId,
                title,
                caption,
                location,
                people,
                blobUrl: upload.blobUrl,
                thumbnailUrl: null,
                createdAt: new Date().toISOString(),
                status: "draft"
            };

            const mediaContainer = await getContainer("mediaItems");
            await mediaContainer.items.create(doc);

            return {
                status: 201,
                jsonBody: {
                    ok: true,
                    id,
                    item: doc,
                    upload: {
                        uploadUrl: upload.uploadUrl,
                        blobUrl: upload.blobUrl,
                        expiresOn: upload.expiresOn
                    }
                }
            };
        } catch (err) {
            context.error("createMedia error:", err);
            return { status: 500, jsonBody: { ok: false, error: err.message } };
        }
    }
});
