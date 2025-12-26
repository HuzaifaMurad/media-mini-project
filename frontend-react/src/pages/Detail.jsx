import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, getMedia, listComments, ratingSummary, setRating } from "../api/media";
import { useAuth } from "../state/AuthProvider";
import { Link, useNavigate, useParams } from "react-router-dom";

function Stars({ value, onSelect, disabled }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          className="btn"
          disabled={disabled}
          onClick={() => onSelect(v)}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            borderColor: v <= value ? "rgba(124, 92, 255, 0.55)" : "var(--border)",
            background: v <= value ? "rgba(124, 92, 255, 0.18)" : "rgba(255,255,255,0.06)",
          }}
          title={`${v} star${v > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      setErr(e?.response?.data?.error || String(e));
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
      setErr(e?.response?.data?.error || String(e));
    } finally {
      setBusy(false);
    }
  }

  if (mediaQ.isLoading) return <div className="callout">Loading media…</div>;
  if (mediaQ.error) return <div className="error">Failed to load: {String(mediaQ.error)}</div>;

  const m = mediaQ.data;

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <button className="btn btnGhost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link className="btn btnGhost" to="/">
          Feed
        </Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 0,
          }}
        >
          <div style={{ borderRight: "1px solid var(--border)" }}>
            <img src={m.blobUrl} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <div className="cardPad stack">
            <div>
              <h2 className="title" style={{ fontSize: 20 }}>{m.title}</h2>
              {m.caption ? <p className="subtitle">{m.caption}</p> : <p className="subtitle">—</p>}
            </div>

            <div className="row">
              {m.location ? <span className="badge"><span className="dot primary" /> {m.location}</span> : null}
              {(m.people || []).map((p) => (
                <span key={p} className="badge">
                  <span className="dot" /> {p}
                </span>
              ))}
            </div>

            <div className="hr" />

            <div className="stack">
              <div style={{ fontWeight: 900 }}>Rating</div>
              <div className="help">
                Avg: <b>{ratingQ.data?.avg ?? 0}</b> • Count: <b>{ratingQ.data?.count ?? 0}</b>
              </div>
              <Stars value={rounded} onSelect={chooseRating} disabled={!canInteract || busy} />

              {!canInteract ? (
                <div className="callout">
                  You must <Link to="/login" style={{ textDecoration: "underline" }}>login</Link> to rate and comment.
                </div>
              ) : null}
            </div>

            <div className="hr" />

            <div className="stack">
              <div style={{ fontWeight: 900 }}>Comments</div>

              {err ? <div className="error">{err}</div> : null}

              {canInteract ? (
                <div className="row">
                  <input
                    className="input"
                    id="comment"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment…"
                    maxLength={500}
                  />
                  <button className="btn btnPrimary" disabled={busy} onClick={submitComment}>
                    {busy ? "Sending…" : "Send"}
                  </button>
                </div>
              ) : null}

              <div className="stack" style={{ gap: 10 }}>
                {(commentsQ.data || []).length === 0 ? (
                  <div className="help">No comments yet.</div>
                ) : (
                  (commentsQ.data || []).map((c) => (
                    <div key={c.id} className="card" style={{ padding: 12, borderRadius: 14 }}>
                      <div style={{ fontWeight: 700 }}>{c.text}</div>
                      <div className="help" style={{ marginTop: 6 }}>
                        {c.createdAt}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .card > div { grid-template-columns: 1fr !important; }
          .card > div > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  );
}
