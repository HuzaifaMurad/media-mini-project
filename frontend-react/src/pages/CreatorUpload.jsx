import { useMemo, useState } from "react";
import { createMediaDraft, finalizeMedia, uploadToSas } from "../api/media";
import { useAuth } from "../state/AuthProvider";
import { Link } from "react-router-dom";

const MAX_MB = 8;

export default function CreatorUpload() {
  const { me, isCreator } = useAuth();

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [peopleText, setPeopleText] = useState("");
  const [file, setFile] = useState(null);

  const [phase, setPhase] = useState(""); // "", "draft", "upload", "finalize"
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const people = useMemo(() => {
    return peopleText.split(",").map((s) => s.trim()).filter(Boolean);
  }, [peopleText]);

  const isSubmitting = phase !== "";

  function setSelectedFile(f) {
    setError("");
    setSuccessId("");

    setFile(f || null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessId("");

    if (!me.isAuthenticated) return setError("Please login first.");
    if (!isCreator) return setError("Creator role required to upload.");
    if (!title.trim()) return setError("Title is required.");
    if (!file) return setError("Please choose an image.");
    if (!file.type.startsWith("image/")) return setError("Only image files are supported.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Max file size is ${MAX_MB}MB.`);

    try {
      setPhase("draft");

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
      if (!id || !uploadUrl) throw new Error("Draft created but upload URL missing.");

      setPhase("upload");
      await uploadToSas(uploadUrl, file);

      setPhase("finalize");
      await finalizeMedia(id);

      setSuccessId(id);

      // reset form
      setTitle("");
      setCaption("");
      setLocation("");
      setPeopleText("");
      setSelectedFile(null);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Upload failed.";
      setError(String(msg));
    } finally {
      setPhase("");
    }
  }

  if (!me.isAuthenticated) {
    return (
      <div className="stack">
        <h1 className="title">Creator Upload</h1>
        <div className="callout">
          You must <Link to="/login" style={{ textDecoration: "underline" }}>login</Link> to upload.
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="stack">
        <h1 className="title">Creator Upload</h1>
        <div className="callout">
          Your account is <b>Consumer</b>. Only <b>Creator</b> can upload.
          <div className="help" style={{ marginTop: 8 }}>
            Ask your coursework supervisor to add your email into <code>CREATOR_EMAILS</code> in Function App settings.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <h1 className="title">Creator Upload</h1>
        <p className="subtitle">Create a post (draft → upload via SAS → finalize).</p>
      </div>

      <div className="card cardPad">
        <form onSubmit={onSubmit} className="stack">
          <label className="label" htmlFor="title">
            Title *
            <input
              className="input"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset in London"
              maxLength={80}
            />
          </label>

          <label className="label" htmlFor="caption">
            Caption
            <textarea
              className="textarea"
              id="caption"
              name="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something…"
              rows={3}
              maxLength={400}
            />
          </label>

          <div className="row" style={{ alignItems: "flex-start" }}>
            <label className="label" htmlFor="location" style={{ flex: 1 }}>
              Location
              <input
                className="input"
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Manchester"
                maxLength={40}
              />
            </label>

            <label className="label" htmlFor="people" style={{ flex: 1 }}>
              People (comma-separated)
              <input
                className="input"
                id="people"
                name="people"
                value={peopleText}
                onChange={(e) => setPeopleText(e.target.value)}
                placeholder="e.g. Ali, Ahmed"
                maxLength={120}
              />
            </label>
          </div>

          <label className="label" htmlFor="image">
            Image *
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <div className="help">
              Allowed: images only • Max size: {MAX_MB}MB
            </div>
          </label>

          {previewUrl ? (
            <div className="card" style={{ overflow: "hidden", borderRadius: 18 }}>
              <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 380, objectFit: "cover" }} />
            </div>
          ) : null}

          {error ? <div className="error">{error}</div> : null}

          {successId ? (
            <div className="success">
              Uploaded successfully ✅
              <div className="help" style={{ marginTop: 6 }}>
                Post ID: <b>{successId}</b>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <Link className="btn" to="/">Back to Feed</Link>
                <Link className="btn btnPrimary" to={`/media/${successId}`}>Open Post</Link>
              </div>
            </div>
          ) : null}

          <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
            {phase === ""
              ? "Upload"
              : phase === "draft"
              ? "Creating draft…"
              : phase === "upload"
              ? "Uploading…"
              : "Finalizing…"}
          </button>
        </form>
      </div>
    </div>
  );
}
