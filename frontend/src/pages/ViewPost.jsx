// frontend/src/pages/ViewPost.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function ViewPost() {
  const nav = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!id) throw new Error("Missing id");
        const res = await api.get(`/api/posts/${id}/`);
        setPost(res.data);
        setImages(res.data?.images || []); // expect array of URLs
      } catch (e) {
        setError("Couldn’t load the post. Showing a placeholder.");
        // Fallback placeholder so the UI still renders
        setPost({
          title: "Sample Title",
          location: "Library",
          date: "2025-10-04",
          contact: "email@example.com",
          description: "This is a placeholder post for preview.",
        });
        setImages(["/placeholder.png"]);
      }
    })();
  }, [id]);

  const thumbs = useMemo(() => images || [], [images]);

  if (!post) {
    return (
      <div className="center">
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <div className="create-shell">
      {/* Overlay UNDER card, OVER the rest */}
      <div className="create-overlay" />

      {/* Card wrapper ABOVE overlay */}
      <div className="create-modal">
        {/* top bar with centered title */}
        <div className="create-toolbar">
          <button className="icon-btn" onClick={() => nav(-1)}>&larr;</button>

          <div className="grow" />
          <h2>Post Details</h2>
          <div className="grow" />

          <button
            className="icon-btn"
            onClick={() => nav("/lost")}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && <div className="error" style={{ maxWidth: 1100, margin: "10px auto" }}>{error}</div>}

        {/* two-column layout (same structure as Create) */}
        <div className="create-grid">
          {/* LEFT: image viewer */}
          <section className="upload-pane">
            {thumbs.length ? (
              <>
                <img
                  className="upload-preview"
                  src={thumbs[index]}
                  alt={`image ${index + 1}`}
                />
                {thumbs.length > 1 && (
                  <>
                    <button
                      className="round ghost left"
                      onClick={() =>
                        setIndex((index - 1 + thumbs.length) % thumbs.length)
                      }
                    >
                      &lt;
                    </button>
                    <button
                      className="round ghost right"
                      onClick={() =>
                        setIndex((index + 1) % thumbs.length)
                      }
                    >
                      &gt;
                    </button>
                  </>
                )}
                <div className="thumbs">
                  {thumbs.map((src, i) => (
                    <button
                      key={i}
                      className={"thumb" + (i === index ? " active" : "")}
                      onClick={() => setIndex(i)}
                      type="button"
                    >
                      <img src={src} alt={`thumb ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-upload">
                <div className="icon">🖼️</div>
                <p>No images</p>
              </div>
            )}
          </section>

          {/* RIGHT: read-only fields */}
          <section className="form-pane">
            <label className="field">
              <span>Title</span>
              <div className="ro">{post.title || "—"}</div>
            </label>

            <label className="field">
              <span>Location</span>
              <div className="ro">{post.location || "—"}</div>
            </label>

            <label className="field">
              <span>Date</span>
              <div className="ro">{post.date || "—"}</div>
            </label>

            <label className="field">
              <span>Contact Details</span>
              <div className="ro">{post.contact || "—"}</div>
            </label>

            <label className="field">
              <span>Description</span>
              <div className="ro" style={{ whiteSpace: "pre-wrap" }}>
                {post.description || "—"}
              </div>
            </label>

            <div className="actions">
              <button className="btn" type="button" onClick={() => nav(-1)}>
                Close
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
