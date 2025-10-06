// frontend/src/pages/ViewPost.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function ViewPost() {
  const nav = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

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

  return (
    <div className="create-shell">
      {/* Overlay UNDER the card, OVER the rest of the app */}
      <div className="create-overlay" />

      {/* Card wrapper ABOVE the overlay */}
      <div className="create-modal">
        {/* top bar like your mock, with centered title */}
        <div className="create-toolbar">
          <button className="icon-btn" onClick={() => nav(-1)}>&larr;</button>

          <div className="grow" />
          <h2>{post.status === "lost" ? "Lost" : "Found"} Item</h2>
          <div className="grow" />

          <button
            className="icon-btn"
            onClick={() => nav(-1)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* main two-column layout */}
        <div className="create-grid">
          {/* LEFT: image display */}
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

          {/* RIGHT: post details */}
          <div className="form-pane">
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
              <div style={{ padding: "8px 0" }}>{post.date}</div>
            </div>

            <div className="field">
              <span>Posted by</span>
              <div style={{ padding: "8px 0" }}>{post.owner_name}</div>
            </div>

            <div className="field">
              <span>Description</span>
              <div style={{ padding: "8px 0", lineHeight: "1.5" }}>
                {post.description}
              </div>
            </div>

            <div className="actions">
              <button className="btn" type="button" onClick={() => nav(-1)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
