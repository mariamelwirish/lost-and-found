// frontend/src/components/PostsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/**
 * Props:
 *  - kind: "lost" | "found"
 *  - mine: boolean   // true => only my posts
 */
export default function PostsList({ kind, mine }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);   // ✅ start as array
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/api/posts/", {
          params: { kind, mine: mine ? 1 : 0 },
        });

        // ✅ normalize to an array no matter the payload shape
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (!alive) return;
        setItems(list);
        setErr("");
      } catch (e) {
        if (!alive) return;
        setErr("Couldn't load posts (showing empty state).");
        setItems([]); // ✅ still renderable
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [kind, mine]);

  const emptyTitle = kind === "lost" ? "No lost items yet" : "No found items yet";
  const emptyDesc =
    kind === "lost"
      ? "When someone reports a lost item, it will appear here."
      : "When someone reports a found item, it will appear here.";

  if (loading) {
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
        {items.map((p, idx) => (
          <article 
            key={p.id ?? p._id ?? idx} 
            style={{ 
              background: "#fff", 
              border: "1px solid var(--muted, #e5e5e5)", 
              borderRadius: 10, 
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onClick={() => navigate(`/posts/${p.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {p.images?.length ? (
              <img src={p.images[0].image} alt={p.title || "post"} style={{ width: "100%", height: 160, objectFit: "cover" }} />
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
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
