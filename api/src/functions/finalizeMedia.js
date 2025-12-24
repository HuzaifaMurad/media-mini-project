const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");
const { getContainer } = require("../cosmosClient");

function getBlobServiceClient() {
  const accountName = process.env.STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.STORAGE_ACCOUNT_KEY;

  if (!accountName || !accountKey) throw new Error("Missing STORAGE_ACCOUNT_NAME or STORAGE_ACCOUNT_KEY");

  const connString =
    `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;

  return BlobServiceClient.fromConnectionString(connString);
}

app.http("finalizeMediaV4", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "v4/media/{id}/finalize",
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!id) return { status: 400, jsonBody: { ok: false, error: "id is required" } };

      const mediaContainer = await getContainer("mediaItems");
      const { resource } = await mediaContainer.item(id, "MEDIA").read();
      if (!resource) return { status: 404, jsonBody: { ok: false, error: "media not found" } };

      // verify blob exists
      const containerName = process.env.STORAGE_CONTAINER_NAME || "media";
      const blobName = resource.blobUrl.split("/").pop();

      const blobService = getBlobServiceClient();
      const containerClient = blobService.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      const exists = await blobClient.exists();
      if (!exists) {
        return { status: 400, jsonBody: { ok: false, error: "Blob not uploaded yet. Upload first using SAS URL." } };
      }

      resource.status = "active";
      resource.finalizedAt = new Date().toISOString();
      await mediaContainer.items.upsert(resource);

      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      context.error("finalizeMediaV4 error", err);
      return { status: 500, jsonBody: { ok: false, error: err.message } };
    }
  }
});
