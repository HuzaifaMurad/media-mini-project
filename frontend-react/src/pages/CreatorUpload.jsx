import React, { useMemo, useState } from "react";
import { createMediaDraft, finalizeMedia, uploadToSas } from "../api/media";

export default function CreatorUpload() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [peopleText, setPeopleText] = useState("");
  const [file, setFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");

  const people = useMemo(() => {
    return peopleText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [peopleText]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessId("");

    if (!title.trim()) return setError("Title is required.");
    if (!file) return setError("Please choose an image file.");

    if (!file.type.startsWith("image/")) {
      return setError("Only image files are supported.");
    }

    setIsSubmitting(true);
    try {
      // 1) Create draft (gets SAS uploadUrl)
      const draftRes = await createMediaDraft({
        title: title.trim(),
        caption: caption.trim(),
        location: location.trim(),
        people,
        fileName: file.name,
        contentType: file.type,
      });

      const id = draftRes?.id;
      const uploadUrl = draftRes?.upload?.uploadUrl;

      if (!id || !uploadUrl) {
        throw new Error("Draft created but upload URL missing.");
      }

      // 2) Upload bytes to Azure Blob via SAS URL
      await uploadToSas(uploadUrl, file);

      // 3) Finalize (draft -> active)
      await finalizeMedia(id);

      setSuccessId(id);

      // Reset form
      setTitle("");
      setCaption("");
      setLocation("");
      setPeopleText("");
      setFile(null);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        "Upload failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "20px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Creator Upload</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
        }}
      >
        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              <div style={{ fontWeight: 600 }}>Title *</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunset in London"
                style={inputStyle}
              />
            </label>

            <label>
              <div style={{ fontWeight: 600 }}>Caption</div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </label>

            <label>
              <div style={{ fontWeight: 600 }}>Location</div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London"
                style={inputStyle}
              />
            </label>

            <label>
              <div style={{ fontWeight: 600 }}>People (comma-separated)</div>
              <input
                value={peopleText}
                onChange={(e) => setPeopleText(e.target.value)}
                placeholder="e.g. Ali, Ahmed"
                style={inputStyle}
              />
            </label>

            <label>
              <div style={{ fontWeight: 600 }}>Image *</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>
                  Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                </div>
              ) : null}
            </label>

            {error ? (
              <div style={{ color: "#b00020", fontWeight: 600 }}>{error}</div>
            ) : null}

            {successId ? (
              <div style={{ color: "green", fontWeight: 600 }}>
                Uploaded successfully ✅ (id: {successId})
                <div style={{ fontWeight: 400, marginTop: 6 }}>
                  Go back to the feed and refresh (we’ll automate refresh next).
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 6,
  outline: "none",
};
