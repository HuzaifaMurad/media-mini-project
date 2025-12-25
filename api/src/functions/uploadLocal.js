const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");

function isAzurite() {
  return (process.env.AzureWebJobsStorage || "").includes("UseDevelopmentStorage=true");
}

app.http("uploadLocal", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "dev/upload/{blobName}",
  handler: async (request, context) => {
    try {
      if (!isAzurite()) {
        return { status: 400, jsonBody: { ok: false, error: "This endpoint is only for local Azurite dev." } };
      }

      const blobName = request.params.blobName;
      const containerName = process.env.STORAGE_CONTAINER_NAME || "media";

      // read raw bytes
      const contentType = request.headers.get("content-type") || "application/octet-stream";
      const arrayBuffer = await request.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const blobService = BlobServiceClient.fromConnectionString("UseDevelopmentStorage=true");
      const container = blobService.getContainerClient(containerName);
      await container.createIfNotExists();

      const blobClient = container.getBlockBlobClient(blobName);
      await blobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });

      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      context.error("uploadLocal error:", err);
      return { status: 500, jsonBody: { ok: false, error: err.message } };
    }
  },
});
