import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listMedia } from "../api/media";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["media", q],
    queryFn: () => listMedia({ query: q }),
  });

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
        <button onClick={() => refetch()}>Search</button>
      </div>

      {isLoading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{String(error)}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {data.map((m) => (
          <div
            key={m.id}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/media/${m.id}`)}
          >
            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", borderRadius: 12, border: "1px solid #eee" }}>
              <img src={m.blobUrl} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>{m.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
