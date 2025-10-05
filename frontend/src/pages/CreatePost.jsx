// frontend/src/pages/CreatePost.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // your axios client (uses VITE_API_URL)

export default function CreatePost() {
  const nav = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [contact, setContact] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);        // File[]
  const [index, setIndex] = useState(0);         // which image is shown
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  function pickFiles() {
    fileInputRef.current?.click();
  }
  function onFilesSelected(e) {
    const list = Array.from(e.target.files || []);
    if (list.length) {
      setFiles(prev => [...prev, ...list]);
      if (files.length === 0) setIndex(0);
    }
  }
  function onDrop(e) {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length) {
      setFiles(prev => [...prev, ...list]);
      if (files.length === 0) setIndex(0);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("location", location);
      fd.append("date", date);
      fd.append("contact", contact);
      fd.append("description", desc);
      files.forEach((f) => fd.append("images", f, f.name)); // adjust name if backend differs

      await api.post("/api/posts/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      nav("/my-posts");
    } catch (err) {
      console.error(err);
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
          <h2>Create Post</h2>
          <div className="grow" />

          <button
            className="icon-btn"
            onClick={() => nav("/my-posts")}
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
                <small>Drag & drop or click</small>
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
              <select value={location} onChange={(e) => setLocation(e.target.value)} required>
                <option value="" disabled>
                  Select
                </option>
                <option>Library</option>
                <option>Student Center</option>
                <option>Engineering Building</option>
                <option>Other</option>
              </select>
            </label>

            <label className="field">
              <span>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <label className="field">
              <span>Contact Details</span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone"
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                rows="6"
                maxLength={200}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <div className="charcount">{desc.length}/200</div>
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
