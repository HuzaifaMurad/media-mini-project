// import { api } from "./client";

// export async function listMedia({ query = "", skip = 0, take = 20 } = {}) {
//   const res = await api.get("/media", { params: { query, skip, take } });
//   return res.data?.items || [];
// }

// export async function getMedia(id) {
//   const res = await api.get(`/media/${id}`);
//   return res.data?.item;
// }

// export async function listComments(id) {
//   const res = await api.get(`/media/${id}/comments`);
//   return res.data?.items || [];
// }

// export async function ratingSummary(id) {
//   const res = await api.get(`/media/${id}/rating/summary`);
//   return res.data || { avg: 0, count: 0 };
// }

// export async function addComment(id, text) {
//   const res = await api.post(`/media/${id}/comments`, { text });
//   return res.data;
// }

// export async function setRating(id, value) {
//   const res = await api.put(`/media/${id}/rating`, { value });
//   return res.data;
// }

// export async function createMediaDraft(payload) {
//   const res = await api.post(`/media`, payload);
//   return res.data; // { ok, id, upload: { uploadUrl, blobUrl } ... }
// }

// export async function finalizeMedia(id) {
//   const res = await api.post(`/media/${id}/finalize`);
//   return res.data;
// }

// // Local-only (Azurite) upload endpoint you already have
// export async function uploadLocalBlob(blobName, bytes, contentType) {
//   await api.post(`/dev/upload/${blobName}`, bytes, {
//     headers: { "Content-Type": contentType },
//   });
// }

// // Production SAS upload (direct PUT)
// // export async function uploadToSas(uploadUrl, bytes, contentType) {
// //   const res = await fetch(uploadUrl, {
// //     method: "PUT",
// //     headers: {
// //       "x-ms-blob-type": "BlockBlob",
// //       "Content-Type": contentType,
// //       "x-ms-blob-content-type": contentType,
// //     },
// //     body: bytes,
// //   });

// //   if (!res.ok) {
// //     const text = await res.text().catch(() => "");
// //     throw new Error(`SAS upload failed (${res.status}): ${text}`);
// //   }
// // }

// export async function uploadToSas(uploadUrl, file) {
//   const res = await axios.put(uploadUrl, file, {
//     headers: {
//       "x-ms-blob-type": "BlockBlob",
//       "Content-Type": file.type || "application/octet-stream",
//     },
//   });
//   return res.status; // typically 201
// }



import axios from "axios";
import { creatorApi, consumerApi } from "./client";

// FEED + DETAILS can use consumer (read-only)
export async function listMedia(params) {
  const res = await consumerApi.get("/media", { params });
  return res.data.items;
}

export async function getMedia(id) {
  const res = await consumerApi.get(`/media/${id}`);
  return res.data.item;
}

// COMMENTS (consumer)
export async function listComments(mediaId) {
  const res = await consumerApi.get(`/media/${mediaId}/comments`);
  return res.data.items;
}

export async function addComment(mediaId, text) {
  const res = await consumerApi.post(`/media/${mediaId}/comments`, { text });
  return res.data;
}

// RATINGS (consumer)
export async function ratingSummary(mediaId) {
  const res = await consumerApi.get(`/media/${mediaId}/rating/summary`);
  return res.data;
}

export async function setRating(mediaId, value) {
  const res = await consumerApi.put(`/media/${mediaId}/rating`, { value });
  return res.data;
}

// UPLOAD (creator)
export async function createMediaDraft(payload) {
  const res = await creatorApi.post("/media", payload);
  return res.data;
}

export async function finalizeMedia(id) {
  const res = await creatorApi.post(`/media/${id}/finalize`);
  return res.data;
}

// SAS upload (direct to blob)
export async function uploadToSas(uploadUrl, file) {
  const res = await axios.put(uploadUrl, file, {
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": file.type || "application/octet-stream",
    },
  });
  return res.status;
}
