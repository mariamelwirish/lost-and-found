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
  const [customLocation, setCustomLocation] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);        // File[]
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
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
      fd.append("location", locationField === "Other" ? customLocation : locationField);
      fd.append("date", date);
      fd.append("description", desc);
      fd.append("status", postType);
      
      // Add contact info if user chose to show them
      if (showEmail) fd.append("contact_email", user.email);
      if (showPhone) fd.append("contact_phone", user.phone || "");
      
      // Use uploaded_images to match backend serializer
      files.forEach((f) => fd.append("uploaded_images", f));

      const response = await api.post("/api/posts/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
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
                <option>Ada Dodge Hall</option>
                <option>Assembly Hall</option>
                <option>Ayman and Sawsan Asfari Building</option>
                <option>Bechtel Engineering</option>
                <option>Biology Building</option>
                <option>Building 20 Admissions and Financial Aid Building</option>
                <option>Building 42</option>
                <option>Campus Administrative Building (CAB)</option>
                <option>CCC Scientific Research Building</option>
                <option>Charles Hostler Student Center</option>
                <option>College Hall</option>
                <option>Corporation Yard Building</option>
                <option>Daniel Bliss Hall</option>
                <option>Dar Al Handasah Architecture and Design Building</option>
                <option>Diana Tamari Sabbagh Building</option>
                <option>Elmer and Mamdouha Bobst Chemistry Building</option>
                <option>Emile Bustani Physics Building Hall</option>
                <option>Facility Satellite Building 1</option>
                <option>Facility Satellite Building 2</option>
                <option>Faculty Apartments II</option>
                <option>Faculty Apartments III</option>
                <option>Faculty Apartments IV</option>
                <option>Faculty of Agriculture and Food Sciences</option>
                <option>Fisk Hall</option>
                <option>Irani Oxy Engineering Complex</option>
                <option>Issam Fares Institute</option>
                <option>Izzat Jaroudi Old Pharmacy Building</option>
                <option>Jafet Memorial Library</option>
                <option>Jesup Hall</option>
                <option>Jewett Hall (Women's Dorm)</option>
                <option>Kerr Hall (Men's Dorm)</option>
                <option>Laundry</option>
                <option>Laura Bustani Hall (Women's Dorm)</option>
                <option>Lee Observatory Building</option>
                <option>Main Gate</option>
                <option>Marquand House</option>
                <option>Mary Dodge Hall</option>
                <option>Munib and Angela Masri Building</option>
                <option>Murex Hall (Women's Dorm)</option>
                <option>New Pilot Plant</option>
                <option>New Women's Dorm</option>
                <option>Nicely Hall</option>
                <option>Off Campus Women's Dorms</option>
                <option>Penrose Hall</option>
                <option>Post Hall</option>
                <option>Power Plant & Steam Plant</option>
                <option>Raymond Ghosn Building</option>
                <option>Residence 38</option>
                <option>Residence 39</option>
                <option>Residence 41</option>
                <option>Reynolds Hall</option>
                <option>Science Lecture Hall</option>
                <option>Suliman S. Olayan School of Business</option>
                <option>Van Dyck Hall</option>
                <option>Warehouse</option>
                <option>West Hall</option>
                <option>Other</option>
              </select>
            </label>

            {locationField === "Other" && (
              <label className="field">
                <span>Custom Location</span>
                <input 
                  type="text" 
                  value={customLocation} 
                  onChange={(e) => setCustomLocation(e.target.value)} 
                  placeholder="Enter location..."
                  required 
                />
              </label>
            )}

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

            <div style={{ marginTop: 12, padding: 10, background: "#f8f4ff", borderRadius: 8, border: "1px dashed #c4b0cd" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#9C81A8" }}> Contact Information (Auto-filled)</h4>
              <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>Choose what contact info to show publicly:</p>
              
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={showEmail} 
                  onChange={(e) => setShowEmail(e.target.checked)}
                />
                <span style={{ fontSize: 13 }}> Show email: <strong>{user.email}</strong></span>
              </label>
              
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={showPhone} 
                  onChange={(e) => setShowPhone(e.target.checked)}
                />
                <span style={{ fontSize: 13 }}> Show phone: <strong>{user.phone || "Not provided"}</strong></span>
              </label>
            </div>

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
