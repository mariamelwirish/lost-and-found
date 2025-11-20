import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../api";
import { getUser } from "../utils/session";
import { LOCATIONS } from "../data/locations";

export default function EditPost() {
  const nav = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const user = getUser();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);
  
  // form state
  const [title, setTitle] = useState("");
  const [locationField, setLocationField] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const fileInputRef = useRef(null);

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }

    if (hasLoaded.current) return; // Prevent multiple loads

    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}/`);
        const postData = res.data;
        
        const canManage = postData.owner === user.id || user.is_staff;
        if (!canManage) {
          alert("You can only edit your own posts");
          nav(-1);
          return;
        }
        
        setPost(postData);
        setIsOwner(postData.owner === user.id);
        setTitle(postData.title);
        // Handle location - check if it's a predefined option or custom
        const aubBuildings = [
          "Ada Dodge Hall", "Assembly Hall", "Ayman and Sawsan Asfari Building", "Bechtel Engineering",
          "Biology Building", "Building 20 Admissions and Financial Aid Building", "Building 42",
          "Campus Administrative Building (CAB)", "CCC Scientific Research Building", "Charles Hostler Student Center",
          "College Hall", "Corporation Yard Building", "Daniel Bliss Hall", "Dar Al Handasah Architecture and Design Building",
          "Diana Tamari Sabbagh Building", "Elmer and Mamdouha Bobst Chemistry Building", "Emile Bustani Physics Building Hall",
          "Facility Satellite Building 1", "Facility Satellite Building 2", "Faculty Apartments II", "Faculty Apartments III",
          "Faculty Apartments IV", "Faculty of Agriculture and Food Sciences", "Fisk Hall", "Irani Oxy Engineering Complex",
          "Issam Fares Institute", "Izzat Jaroudi Old Pharmacy Building", "Jafet Memorial Library", "Jesup Hall",
          "Jewett Hall (Women's Dorm)", "Kerr Hall (Men's Dorm)", "Laundry", "Laura Bustani Hall (Women's Dorm)",
          "Lee Observatory Building", "Main Gate", "Marquand House", "Mary Dodge Hall", "Munib and Angela Masri Building",
          "Murex Hall (Women's Dorm)", "New Pilot Plant", "New Women's Dorm", "Nicely Hall", "Off Campus Women's Dorms",
          "Penrose Hall", "Post Hall", "Power Plant & Steam Plant", "Raymond Ghosn Building", "Residence 38",
          "Residence 39", "Residence 41", "Reynolds Hall", "Science Lecture Hall", "Suliman S. Olayan School of Business",
          "Van Dyck Hall", "Warehouse", "West Hall"
        ];
        if (aubBuildings.includes(postData.location)) {
          setLocationField(postData.location);
          setCustomLocation("");
        } else {
          setLocationField("Other");
          setCustomLocation(postData.location);
        }
        setDate(postData.date);
        setDesc(postData.description);
        setExistingImages(postData.images || []);
        setShowEmail(!!postData.contact_email);
        setShowPhone(!!postData.contact_phone);
        hasLoaded.current = true;
        
      } catch (err) {
        console.error(err);
        alert("Failed to load post");
        nav(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id, user, nav]);

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

  const activeExistingImages = existingImages.filter(img => !imagesToDelete.includes(img.id));
  const totalImages = activeExistingImages.length + files.length;
  const canAddMore = totalImages < 3;

  function pickFiles() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(e) {
    const list = Array.from(e.target.files || []);
    const totalImages = existingImages.length - imagesToDelete.length + files.length;
    const canAdd = Math.max(0, 3 - totalImages);
    
    if (list.length && canAdd > 0) {
      setFiles(prev => [...prev, ...list.slice(0, canAdd)]);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    const totalImages = existingImages.length - imagesToDelete.length + files.length;
    const canAdd = Math.max(0, 3 - totalImages);
    
    if (list.length && canAdd > 0) {
      setFiles(prev => [...prev, ...list.slice(0, canAdd)]);
    }
  }

  function removeFile(indexToRemove) {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  }

  function deleteExistingImage(imageId) {
    setImagesToDelete(prev => [...prev, imageId]);
  }

  function restoreExistingImage(imageId) {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
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
      fd.append("status", post.status);
      
      if (isOwner) {
        // Owner edits decide whether contact info is public
        fd.append("contact_email", showEmail ? user.email : "");
        fd.append("contact_phone", showPhone ? (user.phone || "") : "");
      }
      
      // Add new images
      files.forEach((f) => fd.append("uploaded_images", f));
      
      // Add images to delete
      imagesToDelete.forEach(id => fd.append("delete_images", id));

      await api.patch(`/api/posts/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      alert("Post updated successfully");
      nav(`/posts/${id}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-shell">
      <div className="create-overlay" />
      <div className="create-modal">
        <div className="create-toolbar">
          <button className="icon-btn" onClick={() => nav(post.status === "lost" ? "/lost" : "/found")}>&larr;</button>
          <div className="grow" />
          <h2>Edit {post.status === "lost" ? "Lost" : "Found"} Post</h2>
          <div className="grow" />
          <button className="icon-btn" onClick={() => nav(post.status === "lost" ? "/lost" : "/found")}>×</button>
        </div>

        <div className="create-grid">
          <section className="upload-pane" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Current Images ({activeExistingImages.length})</h4>
              {activeExistingImages.length > 0 ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {activeExistingImages.map(img => (
                    <div key={img.id} style={{ position: "relative" }}>
                      <img src={img.image} alt="Current" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
                      <button
                        onClick={() => deleteExistingImage(img.id)}
                        type="button"
                        style={{
                          position: "absolute", top: -5, right: -5,
                          background: "#dc2626", color: "white", border: "none",
                          width: 18, height: 18, borderRadius: "50%",
                          fontSize: 12, cursor: "pointer"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>No current images</p>
              )}
            </div>

            {imagesToDelete.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#dc2626" }}>To Delete ({imagesToDelete.length})</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {existingImages.filter(img => imagesToDelete.includes(img.id)).map(img => (
                    <div key={img.id} style={{ position: "relative", opacity: 0.5 }}>
                      <img src={img.image} alt="To delete" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
                      <button
                        onClick={() => restoreExistingImage(img.id)}
                        type="button"
                        style={{
                          position: "absolute", top: -5, right: -5,
                          background: "#16a34a", color: "white", border: "none",
                          width: 18, height: 18, borderRadius: "50%",
                          fontSize: 12, cursor: "pointer"
                        }}
                      >
                        ↶
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#16a34a" }}>New Images ({files.length})</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={src} alt="New" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
                      <button
                        onClick={() => removeFile(i)}
                        type="button"
                        style={{
                          position: "absolute", top: -5, right: -5,
                          background: "#dc2626", color: "white", border: "none",
                          width: 18, height: 18, borderRadius: "50%",
                          fontSize: 12, cursor: "pointer"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canAddMore && (
              <div className="empty-upload" onClick={pickFiles} style={{ minHeight: 100 }}>
                <div className="icon">🖼️</div>
                <p>Add more images</p>
                <small>Can add {3 - totalImages} more (max 3 total)</small>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onFilesSelected} />
          </section>

          <form className="form-pane" onSubmit={onSubmit} key={post.id}>
            <label className="field">
              <span>Title</span>
              <input 
                key="title"
                value={title} 
                onChange={(e) => {
                  setTitle(e.target.value);
                }} 
                required 
              />
            </label>

            <label className="field">
              <span>Location</span>
              <select 
                key="location"
                value={locationField} 
                onChange={(e) => setLocationField(e.target.value)} 
                required
              >
                <option value="" disabled>Select</option>
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
              <span>Date {post.status === "lost" ? "Lost" : "Found"}</span>
              <input 
                key="date"
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                key="description"
                rows="6"
                maxLength={500}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
              <div className="charcount">{desc.length}/500</div>
            </label>

            <div style={{ marginTop: 12, padding: 10, background: "#f8f4ff", borderRadius: 8, border: "1px dashed #c4b0cd" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#9C81A8" }}>Contact Information</h4>
              {isOwner ? (
                <>
                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>Choose what contact info to show publicly:</p>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={showEmail} 
                      onChange={(e) => setShowEmail(e.target.checked)}
                    />
                    <span style={{ fontSize: 13 }}>Show email: <strong>{user.email}</strong></span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={showPhone} 
                      onChange={(e) => setShowPhone(e.target.checked)}
                    />
                    <span style={{ fontSize: 13 }}>Show phone: <strong>{user.phone || "Not provided"}</strong></span>
                  </label>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>Only the original poster can update contact details.</p>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <div>Email: <strong>{post.contact_email || "Hidden"}</strong></div>
                    <div>Phone: <strong>{post.contact_phone || "Hidden"}</strong></div>
                  </div>
                </>
              )}
            </div>

            <div className="actions">
              <button className="btn" type="button" onClick={() => nav(post.status === "lost" ? "/lost" : "/found")}>Cancel</button>
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? "Updating…" : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
