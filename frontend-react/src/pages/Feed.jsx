import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listMedia } from "../api/media";
import { Link } from "react-router-dom";

function SkeletonCard() {
  return (
    <div className="card">
      <div className="thumb" />
      <div className="cardPad">
        <div style={{ height: 14, width: "70%", background: "rgba(255,255,255,0.10)", borderRadius: 999 }} />
        <div style={{ height: 12, width: "40%", marginTop: 10, background: "rgba(255,255,255,0.08)", borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function Feed() {
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");

  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["media", submittedQ],
    queryFn: () => listMedia({ query: submittedQ }),
  });

  // small UX: search on Enter
  function onSubmit(e) {
    e.preventDefault();
    setSubmittedQ(q.trim());
  }

  const activeItems = useMemo(() => {
    // show only active items if your backend returns draft too (safe)
    return (data || []).filter((x) => (x.status ? x.status === "active" : true));
  }, [data]);

  useEffect(() => {
    // first load
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="title">Feed</h1>
          <p className="subtitle">Browse images, open details, rate and comment.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card cardPad">
        <div className="row">
          <input
            className="input"
            name="query"
            id="query"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, location, people…"
          />
          <button className="btn btnPrimary" type="submit" disabled={isFetching}>
            {isFetching ? "Searching…" : "Search"}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setQ("");
              setSubmittedQ("");
            }}
          >
            Reset
          </button>
        </div>
        <div className="help" style={{ marginTop: 10 }}>
          Tip: try searching a location like “London”.
        </div>
      </form>

      {error ? <div className="error">Failed to load feed: {String(error)}</div> : null}

      {isLoading ? (
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : activeItems.length === 0 ? (
        <div className="callout">
          No media found. If you are a Creator, upload a new post from the Upload tab.
        </div>
      ) : (
        <div className="grid">
          {activeItems.map((m) => (
            <Link key={m.id} to={`/media/${m.id}`} className="card" style={{ overflow: "hidden" }}>
              <div className="thumb">
                <img src={m.blobUrl} alt={m.title} loading="lazy" />
              </div>
              <div className="cardPad">
                <div style={{ fontWeight: 800 }}>{m.title}</div>
                <div className="help" style={{ marginTop: 6 }}>
                  {m.location ? m.location : "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
