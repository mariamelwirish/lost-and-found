// frontend/src/components/PostsList.jsx
import { useEffect, useState } from "react";
import api from "../api";

/**
 * Props:
 *  - kind: "lost" | "found"
 *  - mine: boolean   // true => only my posts
 */
export default function PostsList({ kind, mine }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Adjust to your backend params when ready
        const res = await api.get("/api/posts/", {
          params: { kind, mine: mine ? 1 : 0 },
        });
        if (!alive) return;
        setItems(res.data || []);
      } catch {
        // Fallback: show empty state so UI still renders
        if (!alive) return;
        setErr("Couldn’t load posts (showing empty state).");
        setItems([]);
      }
    })();
    return () => { alive = false; };
  }, [kind, mine]);

  const emptyTitle = kind === "lost" ? "No lost items yet" : "No found items yet";
  const emptyDesc =
    kind === "lost"
      ? "When someone reports a lost item, it will appear here."
      : "When someone reports a found item, it will appear here.";

  if (!items) {
    return (
      <main className="container">
        <div style={{ padding: 24, background: "#fff", borderRadius: 12, border: "1px solid var(--muted, #e5e5e5)" }}>
          Loading…
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container">
        {err && <div className="error" style={{ marginBottom: 12 }}>{err}</div>}
        <div className="card" style={{ padding: 24, background: "#fff", borderRadius: 12, border: "1px solid var(--muted, #e5e5e5)" }}>
          <h3 style={{ marginTop: 0 }}>{emptyTitle}</h3>
          <p>{emptyDesc}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {items.map((p) => (
          <article key={p.id ?? Math.random()} style={{ background: "#fff", border: "1px solid var(--muted, #e5e5e5)", borderRadius: 10, overflow: "hidden" }}>
            {p.images?.length ? (
              <img src={p.images[0]} alt={p.title || "post"} style={{ width: "100%", height: 160, objectFit: "cover" }} />
            ) : (
              <div style={{ height: 160, background: "#f3edf7" }} />
            )}
            <div style={{ padding: 12 }}>
              <h4 style={{ margin: "0 0 6px" }}>{p.title || "Untitled"}</h4>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{p.location || "—"} • {p.date || "—"}</div>
              {p.description && (
                <p style={{ fontSize: 13, marginTop: 10, color: "#334155" }}>
                  {String(p.description).slice(0, 100)}
                  {String(p.description).length > 100 ? "…" : ""}
                </p>
              )}
              {/* Later: <Link to={`/posts/${p.id}`} className="btn" style={{ marginTop: 8 }}>View</Link> */}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
