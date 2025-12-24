const { CosmosClient } = require("@azure/cosmos");

let _client = null;

function getCosmosClient() {
  if (_client) return _client;

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;

  if (!endpoint || !key) {
    throw new Error("Missing COSMOS_ENDPOINT or COSMOS_KEY environment variables.");
  }

  _client = new CosmosClient({ endpoint, key });
  return _client;
}

async function getContainer(containerName) {
  const client = getCosmosClient();
  const dbName = process.env.COSMOS_DB_NAME;

  if (!dbName) {
    throw new Error("Missing COSMOS_DB_NAME environment variable.");
  }

  const { database } = await client.databases.createIfNotExists({ id: dbName });
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    // IMPORTANT: these partition keys must match what you created in Step 4
    partitionKey: containerName === "mediaItems" ? "/pk" : "/mediaId"
  });

  return container;
}

module.exports = { getContainer };
