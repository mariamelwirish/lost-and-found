// frontend/src/pages/ViewPost.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { getUser } from "../utils/session";

export default function ViewPost() {
  const nav = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const user = getUser();


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}/`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load post");
        nav(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id, nav]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await api.delete(`/api/posts/${id}/`);
      alert("Post deleted successfully");
      nav(post.status === "lost" ? "/lost" : "/found");
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleEdit = () => {
    nav(`/my-posts/edit/${id}`, { state: { post }, replace: true });
  };

  const handleMarkReceived = async () => {
    if (!confirm("Confirm item has been received from the poster?")) return;
    try {
      setSaving(true);
      const res = await api.post(`/api/posts/${id}/mark_received/`);
      setPost(res.data);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.detail || "Failed to mark as received");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-shell">
        <div className="create-overlay" />
        <div className="create-modal">
          <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const images = post.images || [];
  const isOwner = user && post.owner === user.id;

  return (
    <div className="create-shell">
      <div className="create-overlay" />
      <div className="create-modal">
        <div className="create-toolbar">
          <button className="icon-btn" onClick={() => nav(-1)}>&larr;</button>
          <div className="grow" />
          <h2>{post.status === "lost" ? "Lost" : "Found"} Item</h2>
          <div className="grow" />
          <button className="icon-btn" onClick={() => nav(post.status === "lost" ? "/lost" : "/found")} aria-label="Close">×</button>
        </div>

        <div className="create-grid">
          <section className="upload-pane">
            {images.length ? (
              <>
                <img
                  className="upload-preview"
                  src={images[index].image}
                  alt={post.title}
                />
                {images.length > 1 && (
                  <>
                    <button
                      className="round ghost left"
                      onClick={() =>
                        setIndex((index - 1 + images.length) % images.length)
                      }
                    >
                      &lt;
                    </button>
                    <button
                      className="round ghost right"
                      onClick={() => setIndex((index + 1) % images.length)}
                    >
                      &gt;
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="empty-upload">
                <div className="icon">🖼️</div>
                <p>No image</p>
              </div>
            )}

            {images.length > 1 && (
              <div className="thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={"thumb" + (i === index ? " active" : "")}
                    onClick={() => setIndex(i)}
                    type="button"
                  >
                    <img src={img.image} alt={`thumb ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <div className="form-pane view-post-card">
            <div className="field">
              <span>Title</span>
              <div style={{ padding: "8px 0", fontSize: "16px", fontWeight: "500" }}>
                {post.title}
              </div>
            </div>

            <div className="field">
              <span>Location</span>
              <div style={{ padding: "8px 0" }}>{post.location}</div>
            </div>

            <div className="field">
              <span>Date {post.status === "lost" ? "Lost" : "Found"}</span>
              <div style={{ padding: "4px 0", fontWeight: "500" }}>{post.date}</div>
            </div>

            <div className="field">
              <span>Posted by</span>
              <div style={{ padding: "4px 0", fontWeight: "500" }}>{post.owner_name}</div>
            </div>

            {post.received_from_poster && (
              <div style={{ margin: "8px 0", color: "#059669", fontWeight: 500 }}>
                ✓ Received from poster{post.received_at ? ` on ${new Date(post.received_at).toLocaleString()}` : ""}
              </div>
            )}

            

            {(post.contact_email || post.contact_phone) && (
              <div className="field">
                <span>Contact Info</span>
                <div style={{ 
                  padding: "8px 12px", 
                  background: "#f8f4ff", 
                  borderRadius: 6, 
                  border: "1px solid #e0d4e7",
                  marginTop: "4px"
                }}>
                  {post.contact_email && (
                    <div style={{ marginBottom: 3, fontSize: 14 }}>
                      <a href={`mailto:${post.contact_email}`} style={{ color: "#9C81A8", textDecoration: "none", fontWeight: "500" }}>{post.contact_email}</a>
                    </div>
                  )}
                  {post.contact_phone && (
                    <div style={{ fontSize: 14 }}>
                      <a href={`tel:${post.contact_phone}`} style={{ color: "#9C81A8", textDecoration: "none" }}>{post.contact_phone}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="field">
              <span>Description</span>
              <div style={{ 
                padding: "8px 0", 
                lineHeight: "1.6",
                color: "#333",
                marginTop: "4px",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
                maxWidth: "100%",
                overflow: "hidden"
              }}>
                {post.description}
              </div>
            </div>

            <div className="actions">
              <button className="btn" type="button" onClick={() => nav(post.status === "lost" ? "/lost" : "/found")}>
                Close
              </button>
              {isOwner && (
                <>
                  {!post.received_from_poster && (
                    <button className="btn primary" type="button" onClick={handleMarkReceived} disabled={saving}>
                      {saving ? "Marking…" : "Mark as received from poster"}
                    </button>
                  )}
                  <button className="btn" type="button" onClick={handleEdit}>
                    Edit
                  </button>
                  <button className="btn" type="button" onClick={handleDelete} style={{ color: "#dc2626" }}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
