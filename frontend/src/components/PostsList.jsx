// frontend/src/components/PostsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getUser } from "../utils/session";

/**
 * Props:
 *  - kind: "lost" | "found"
 *  - mine: boolean   // true => only my posts
 */
export default function PostsList({ kind, mine, filters = {}, receivedOnly = false, excludeReceived = false }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);   // ✅ start as array
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState({});
  const user = getUser();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const params = {
          ...(kind ? { kind } : {}),
          ...(mine ? { mine: 1 } : {}),
          ...filters,              // ← q, location, date_from, date_to
        };
        const res = await api.get("/api/posts/", { params });
        

        // ✅ normalize to an array no matter the payload shape
        const data = res?.data;
        let list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (receivedOnly) {
          list = list.filter((it) => it?.received_from_poster === true);
        } else if (excludeReceived) {
          list = list.filter((it) => it?.received_from_poster !== true);
        }

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
  }, [kind, mine, JSON.stringify(filters), receivedOnly, excludeReceived]);


  const handleDelete = async (postId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await api.delete(`/api/posts/${postId}/`);
      setItems(prev => prev.filter(item => item.id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleEdit = (postId, e) => {
    e.stopPropagation();
    navigate(`/my-posts/edit/${postId}`);
  };

  const nextImage = (postId, imageCount, e) => {
    e.stopPropagation();
    setImageIndexes(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % imageCount
    }));
  };

  const prevImage = (postId, imageCount, e) => {
    e.stopPropagation();
    setImageIndexes(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + imageCount) % imageCount
    }));
  };

  const emptyTitle = mine 
    ? (kind === "lost" ? "I don't have any lost posts" : "I don't have any found posts")
    : (kind === "lost" ? "No lost items yet" : "No found items yet");
  const emptyDesc = mine
    ? "You haven't posted any items yet. Create your first post to get started!"
    : (kind === "lost"
      ? "When someone reports a lost item, it will appear here."
      : "When someone reports a found item, it will appear here.");

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
              <div style={{ position: "relative" }}>
                <img 
                  src={p.images[imageIndexes[p.id] || 0].image} 
                  alt={p.title || "post"} 
                  style={{ width: "100%", height: 160, objectFit: "cover" }} 
                />
                {p.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => prevImage(p.id, p.images.length, e)}
                      style={{
                        position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                        background: "rgba(0,0,0,0.5)", color: "white", border: "none",
                        width: 24, height: 24, borderRadius: "50%", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => nextImage(p.id, p.images.length, e)}
                      style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        background: "rgba(0,0,0,0.5)", color: "white", border: "none",
                        width: 24, height: 24, borderRadius: "50%", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      ›
                    </button>
                    <div style={{
                      position: "absolute", bottom: 8, right: 8,
                      background: "rgba(0,0,0,0.7)", color: "white",
                      padding: "2px 6px", borderRadius: 10, fontSize: 10
                    }}>
                      {(imageIndexes[p.id] || 0) + 1}/{p.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ height: 160, background: "#f3edf7" }} />
            )}
            <div style={{ padding: 12 }}>
              <h4 style={{ margin: "0 0 6px" }}>{p.title || "Untitled"}</h4>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                {p.location || "—"} • {p.date || "—"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                By {p.owner_name || "Unknown"}
              </div>
              {p.received_from_poster && (
                <div style={{ marginTop: 6, fontSize: 11, color: "#059669" }}>
                  ✓ Received from poster
                </div>
              )}
              {mine && user && (
                <></>
              )}
              {mine && user && p.owner === user.id && (
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => handleEdit(p.id, e)}
                    style={{
                      padding: "4px 8px", fontSize: 12, background: "#f3f4f6",
                      border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    style={{
                      padding: "4px 8px", fontSize: 12, background: "#fef2f2",
                      border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", color: "#dc2626"
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
