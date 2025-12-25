import React, { useState } from "react";
import { createMediaDraft, finalizeMedia, uploadLocalBlob, uploadToSas } from "../api/media";
import { useAuth } from "../state/AuthProvider";

export default function Upload({ onDone }) {
  const { isCreator, me } = useAuth();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [people, setPeople] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const isLocal = import.meta.env.DEV;

  async function onSubmit() {
    setErr("");
    if (!title.trim()) return setErr("Title is required");
    if (!file) return setErr("Pick an image");

    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const contentType = file.type || "image/png";
      const fileName = file.name;

      const created = await createMediaDraft({
        title,
        caption,
        location,
        people: people.split(",").map((s) => s.trim()).filter(Boolean),
        fileName,
        contentType,
      });

      const id = created.id;
      const uploadUrl = created.upload.uploadUrl;
      const blobUrl = created.upload.blobUrl;
      const blobName = blobUrl.split("/").pop();

      if (isLocal) {
        await uploadLocalBlob(blobName, bytes, contentType);
      } else {
        await uploadToSas(uploadUrl, bytes, contentType);
      }

      await finalizeMedia(id);
      onDone();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

//   if (!me.isAuthenticated) {
//     return <div style={{ padding: 16 }}>Login first to upload.</div>;
//   }
//   if (!isCreator) {
//     return <div style={{ padding: 16 }}>Not authorized (Creator role required).</div>;
//   }

//const isLocal = import.meta.env.DEV;

if (!isLocal) {
  if (!me.isAuthenticated) return <div style={{ padding: 16 }}>Login first to upload.</div>;
  if (!isCreator) return <div style={{ padding: 16 }}>Not authorized (Creator role required).</div>;
}

  return (
    <div style={{ padding: 16, maxWidth: 520 }}>
      <h2>Creator Upload</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input placeholder="People (comma separated)" value={people} onChange={(e) => setPeople(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        {err && <div style={{ color: "red" }}>{err}</div>}

        <button disabled={busy} onClick={onSubmit}>
          {busy ? "Uploading…" : "Upload & Publish"}
        </button>
      </div>
    </div>
  );
}
