// src/pages/CreatePost.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../api.js";

const LOCATIONS = [
  "Select",
  "Campus Main Gate",
  "Library",
  "Cafeteria",
  "Gym",
  "Dorms",
  "Parking Lot",
];

export default function CreatePostPage() {
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  const navigate = useNavigate();

  const [status, setStatus] = React.useState("lost"); // "lost" | "found"
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("Select");
  const [date, setDate] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [preview, setPreview] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const MAX_DESC = 200;

  React.useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onSelectFile(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }
  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }
  function onDragOver(e) { e.preventDefault(); setDragOver(true); }
  function onDragLeave() { setDragOver(false); }
  function openFilePicker() { fileInputRef.current?.click(); }

  const canSubmit = title.trim() && location !== "Select" && contact.trim();

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    // Build FormData and include common field synonyms
    const fd = new FormData();
    fd.append("title", title);
    fd.append("name", title);                 // synonym

    fd.append("status", status);
    fd.append("state", status);               // synonym

    fd.append("location", location);
    fd.append("place", location);             // synonym

    if (date) {
      fd.append("date", date);
      fd.append("created_at", date);          // synonym
    }

    fd.append("contact", contact);
    fd.append("contact_info", contact);       // synonym

    if (description) {
      fd.append("description", description);
      fd.append("details", description);      // synonym
    }

    if (file) {
      fd.append("image", file);
      fd.append("photo", file);               // synonym
    }

    try {
      await createItem(fd);
      navigate(`/${status}`);                 // back to Lost/Found list
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.message ||
        "Failed to create post.";
      alert(msg);
    }
  }

  return (
    <div className="cp-wrap">
      <header className="cp-header">
        <button className="cp-back" type="button" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h1>Create Post</h1>
      </header>

      <form className="cp-grid" onSubmit={onSubmit}>
        {/* LEFT: Upload area */}
        <section
          className={`cp-upload ${dragOver ? "is-drag" : ""}`}
          onClick={openFilePicker}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? openFilePicker() : null)}
          aria-label="Upload an image"
        >
          {preview ? (
            <img src={preview} alt="Selected" className="cp-upload-preview" />
          ) : (
            <div className="cp-upload-empty">
              <div className="cp-upload-icon" aria-hidden>🖼️</div>
              <div className="cp-upload-title">Upload an image</div>
              <div className="cp-upload-sub">Drag &amp; drop or click</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            hidden
          />
        </section>

        {/* RIGHT: form fields */}
        <section className="cp-form">
          <label className="cp-field">
            <span className="cp-label">Title</span>
            <input className="cp-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label className="cp-field">
            <span className="cp-label">Status</span>
            <select className="cp-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </label>

          <label className="cp-field">
            <span className="cp-label">Location</span>
            <select className="cp-input" value={location} onChange={(e) => setLocation(e.target.value)} required>
              {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </label>

          <label className="cp-field">
            <span className="cp-label">Date</span>
            <input className="cp-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="cp-field">
            <span className="cp-label">Contact Details</span>
            <input className="cp-input" type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or phone" required />
          </label>

          <label className="cp-field cp-field--desc">
            <span className="cp-label">Description</span>
            <textarea className="cp-input cp-textarea" rows={6} maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="cp-help">{description.length}/200</div>
          </label>

          <div className="cp-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>Post</button>
          </div>
        </section>
      </form>
    </div>
  );
}
