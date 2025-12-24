const {
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters
} = require("@azure/storage-blob");

function getStorageCreds() {
  const accountName = process.env.STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.STORAGE_ACCOUNT_KEY;

  if (!accountName || !accountKey) {
    throw new Error("Missing STORAGE_ACCOUNT_NAME or STORAGE_ACCOUNT_KEY");
  }

  return { accountName, sharedKeyCredential: new StorageSharedKeyCredential(accountName, accountKey) };
}

function makeUploadSasUrl(containerName, blobName, contentType) {
  const { accountName, sharedKeyCredential } = getStorageCreds();

  // Permission: create + write (upload)
  const permissions = new BlobSASPermissions();
  permissions.create = true;
  permissions.write = true;

  const expiresOn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions,
      expiresOn,
      contentType // helps set correct content-type on upload in some clients
    },
    sharedKeyCredential
  ).toString();

  const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;
  const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

  return { uploadUrl, blobUrl, expiresOn: expiresOn.toISOString() };
}

module.exports = { makeUploadSasUrl };
