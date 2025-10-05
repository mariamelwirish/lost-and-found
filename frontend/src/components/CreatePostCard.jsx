import React from "react";
import { createItem } from "../api.js";

export default function CreatePostCard({ onCreated }) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState("lost"); // "lost" | "found"
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState(""); // ISO yyyy-mm-dd
  const [imageFile, setImageFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  function onPickImage(e) {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Build payload – if there is a file, use FormData
      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description);
      payload.append("status", status);
      payload.append("location", location);
      if (date) payload.append("date", date);
      if (imageFile) payload.append("image", imageFile);

      const created = await createItem(payload);

      setSuccess("Post created successfully!");
      setTitle(""); setDescription(""); setStatus("lost");
      setLocation(""); setDate(""); setImageFile(null); setPreviewUrl("");
      onCreated?.(created);
    } catch (err) {
      setError(err?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="cp-card" onSubmit={handleSubmit}>
      <h2 className="cp-title">Create a Post</h2>

      {error && <div className="cp-alert cp-alert-error">{error}</div>}
      {success && <div className="cp-alert cp-alert-success">{success}</div>}

      <div className="cp-grid">
        <div className="cp-field">
          <label>Title <span className="req">*</span></label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="AirPods case, black hoodie..."
          />
        </div>

        <div className="cp-field">
          <label>Status <span className="req">*</span></label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        <div className="cp-field">
          <label>Location <span className="req">*</span></label>
          <input
            type="text"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Library, Building B, Cafeteria..."
          />
        </div>

        <div className="cp-field">
          <label>Date (optional)</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className="cp-field cp-col-span">
          <label>Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Color, brand, unique marks, where/when it was lost/found..."
          />
        </div>

        <div className="cp-field cp-col-span">
          <label>Image (optional)</label>
          <input type="file" accept="image/*" onChange={onPickImage} />
          {previewUrl && (
            <div className="cp-image-preview">
              <img src={previewUrl} alt="preview" />
            </div>
          )}
        </div>
      </div>

      <div className="cp-actions">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Posting..." : "Create Post"}
        </button>
      </div>
    </form>
  );
}

