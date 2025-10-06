// frontend/src/pages/CreatePost.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api"; // your axios client (uses VITE_API_URL)
import { getUser } from "../utils/session";

export default function CreatePost() {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
  }, [user, nav]);
  
  // Determine post type from state or referrer
  const postType = useMemo(() => {
    // First check if type was passed in state
    if (location.state?.type) {
      return location.state.type;
    }
    
    // Fallback: check referrer or current path context
    const referrer = document.referrer;
    if (referrer.includes('/found')) {
      return 'found';
    }
    if (referrer.includes('/lost')) {
      return 'lost';
    }
    
    // Default fallback
    return 'lost';
  }, [location.state]);

  // form state
  const [title, setTitle] = useState("");
  const [locationField, setLocationField] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);        // File[]
  const [index, setIndex] = useState(0);         // which image is shown
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  function pickFiles() {
    fileInputRef.current?.click();
  }
  function onFilesSelected(e) {
    const list = Array.from(e.target.files || []);
    if (list.length) {
      setFiles(prev => [...prev, ...list].slice(0, 3)); // limit to 3 images
      if (files.length === 0) setIndex(0);
    }
  }
  function onDrop(e) {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length) {
      setFiles(prev => [...prev, ...list].slice(0, 3)); // limit to 3 images
      if (files.length === 0) setIndex(0);
    }
  }

  function removeFile(indexToRemove) {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    // Adjust current index if needed
    if (indexToRemove <= index && index > 0) {
      setIndex(index - 1);
    } else if (files.length === 1) {
      setIndex(0);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("location", locationField);
      fd.append("date", date);
      fd.append("description", desc);
      fd.append("status", postType);
      
      console.log("Creating post with status:", postType); // Debug log
      
      // Use uploaded_images to match backend serializer
      files.forEach((f) => fd.append("uploaded_images", f));

      const response = await api.post("/api/posts/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Post created:", response.data); // Debug log
      
      // Navigate back to the appropriate page
      nav(postType === "lost" ? "/lost" : "/found");
    } catch (err) {
      console.error("Create post error:", err);
      alert(err?.response?.data?.detail || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

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
          <h2>Create {postType === "lost" ? "Lost" : "Found"} Post</h2>
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
          {/* LEFT: image upload */}
          <section
            className="upload-pane"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {previews.length ? (
              <>
                <img
                  className="upload-preview"
                  src={previews[index]}
                  alt={`preview ${index + 1}`}
                />
                <button
                  className="round ghost delete-btn"
                  onClick={() => removeFile(index)}
                  type="button"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#dc2626",
                    border: "1px solid #dc2626",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
                {previews.length > 1 && (
                  <>
                    <button
                      className="round ghost left"
                      onClick={() =>
                        setIndex((index - 1 + previews.length) % previews.length)
                      }
                    >
                      &lt;
                    </button>
                    <button
                      className="round ghost right"
                      onClick={() => setIndex((index + 1) % previews.length)}
                    >
                      &gt;
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="empty-upload" onClick={pickFiles}>
                <div className="icon">🖼️</div>
                <p>Upload an image</p>
                <small>Drag & drop or click (max 3)</small>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onFilesSelected}
            />
            {previews.length > 0 && (
              <div className="thumbs">
                {previews.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <button
                      className={"thumb" + (i === index ? " active" : "")}
                      onClick={() => setIndex(i)}
                      type="button"
                    >
                      <img src={src} alt={`thumb ${i + 1}`} />
                    </button>
                    <button
                      onClick={() => removeFile(i)}
                      type="button"
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: form fields */}
          <form className="form-pane" onSubmit={onSubmit}>
            <label className="field">
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label className="field">
              <span>Location</span>
              <select value={locationField} onChange={(e) => setLocationField(e.target.value)} required>
                <option value="" disabled>
                  Select
                </option>
                <option>Nicely</option>
                <option>Bliss</option>
                <option>Other</option>
              </select>
            </label>

            <label className="field">
              <span>Date {postType === "lost" ? "Lost" : "Found"}</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                rows="6"
                maxLength={500}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
              <div className="charcount">{desc.length}/500</div>
            </label>

            <div className="actions">
              <button className="btn" type="button" onClick={() => nav(-1)}>
                Cancel
              </button>
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
