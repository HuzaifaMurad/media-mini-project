import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, getMedia, listComments, ratingSummary, setRating } from "../api/media";
import { useAuth } from "../state/AuthProvider";

function Stars({ value, onSelect, disabled }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map((v) => (
        <button
          key={v}
          disabled={disabled}
          onClick={() => onSelect(v)}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "6px 10px",
            background: v <= value ? "#ffd166" : "white",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Detail({ id, onBack }) {
  const qc = useQueryClient();
  const { me } = useAuth();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const mediaQ = useQuery({ queryKey: ["media", id], queryFn: () => getMedia(id) });
  const commentsQ = useQuery({ queryKey: ["comments", id], queryFn: () => listComments(id) });
  const ratingQ = useQuery({ queryKey: ["rating", id], queryFn: () => ratingSummary(id) });

  const canInteract = me.isAuthenticated;

  const rounded = useMemo(() => {
    const a = ratingQ.data?.avg ?? 0;
    return Math.max(0, Math.min(5, Math.round(a)));
  }, [ratingQ.data]);

  async function submitComment() {
    setErr("");
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await addComment(id, comment.trim());
      setComment("");
      await qc.invalidateQueries({ queryKey: ["comments", id] });
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function chooseRating(v) {
    setErr("");
    setBusy(true);
    try {
      await setRating(id, v);
      await qc.invalidateQueries({ queryKey: ["rating", id] });
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  if (mediaQ.isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (mediaQ.error) return <div style={{ padding: 16, color: "red" }}>{String(mediaQ.error)}</div>;
  const m = mediaQ.data;

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <button onClick={onBack}>← Back</button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <img src={m.blobUrl} alt={m.title} style={{ width: "100%", display: "block" }} />
        </div>

        <div>
          <h2 style={{ margin: 0 }}>{m.title}</h2>
          {m.caption && <p>{m.caption}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {m.location && <span style={{ border: "1px solid #eee", padding: "4px 8px", borderRadius: 999 }}>{m.location}</span>}
            {(m.people || []).map((p) => (
              <span key={p} style={{ border: "1px solid #eee", padding: "4px 8px", borderRadius: 999 }}>{p}</span>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <b>Rating</b>
            <div style={{ marginTop: 6 }}>
              <div>Avg: {ratingQ.data?.avg ?? 0} (Count: {ratingQ.data?.count ?? 0})</div>
              <Stars value={rounded} onSelect={chooseRating} disabled={!canInteract || busy} />
              {!canInteract && <div style={{ marginTop: 8 }}>Login to rate and comment.</div>}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <b>Comments</b>
            {err && <div style={{ color: "red", marginTop: 8 }}>{err}</div>}

            {canInteract && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  style={{ flex: 1 }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment…"
                />
                <button disabled={busy} onClick={submitComment}>{busy ? "..." : "Send"}</button>
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              {(commentsQ.data || []).length === 0 ? (
                <div>No comments yet.</div>
              ) : (
                (commentsQ.data || []).map((c) => (
                  <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid #f2f2f2" }}>
                    <div>{c.text}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{c.createdAt}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
