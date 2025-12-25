import { api } from "./client";

export async function listMedia({ query = "", skip = 0, take = 20 } = {}) {
  const res = await api.get("/media", { params: { query, skip, take } });
  return res.data?.items || [];
}

export async function getMedia(id) {
  const res = await api.get(`/media/${id}`);
  return res.data?.item;
}

export async function listComments(id) {
  const res = await api.get(`/media/${id}/comments`);
  return res.data?.items || [];
}

export async function ratingSummary(id) {
  const res = await api.get(`/media/${id}/rating/summary`);
  return res.data || { avg: 0, count: 0 };
}

export async function addComment(id, text) {
  const res = await api.post(`/media/${id}/comments`, { text });
  return res.data;
}

export async function setRating(id, value) {
  const res = await api.put(`/media/${id}/rating`, { value });
  return res.data;
}

export async function createMediaDraft(payload) {
  const res = await api.post(`/media`, payload);
  return res.data; // { ok, id, upload: { uploadUrl, blobUrl } ... }
}

export async function finalizeMedia(id) {
  const res = await api.post(`/media/${id}/finalize`);
  return res.data;
}

// Local-only (Azurite) upload endpoint you already have
export async function uploadLocalBlob(blobName, bytes, contentType) {
  await api.post(`/dev/upload/${blobName}`, bytes, {
    headers: { "Content-Type": contentType },
  });
}

// Production SAS upload (direct PUT)
export async function uploadToSas(uploadUrl, bytes, contentType) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": contentType,
      "x-ms-blob-content-type": contentType,
    },
    body: bytes,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SAS upload failed (${res.status}): ${text}`);
  }
}
