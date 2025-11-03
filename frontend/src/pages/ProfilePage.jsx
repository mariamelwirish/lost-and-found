import { useEffect, useState } from "react";
import api from "../api"; // <-- your axios instance (api.js)

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // build absolute media URL if frontend runs on a different origin
  const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, ""); // e.g. http://127.0.0.1:8000

  useEffect(() => {
    let cancel = false;
    api.get("/api/me/profile/")
      .then(res => { if (!cancel) { setData(res.data); setErr(""); }})
      .catch(e => { if (!cancel) setErr(readErr(e)); })
    return () => { cancel = true; }
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(d => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true); setMsg(""); setErr("");
    try {
      const form = new FormData();
      ["full_name","phone","bio","location","notify_email","notify_push"].forEach(k => {
        if (data[k] !== undefined && data[k] !== null) form.append(k, data[k]);
      });
      if (file) form.append("avatar", file);

      // IMPORTANT: do NOT set Content-Type manually with FormData
      const res = await api.patch("/api/me/profile/", form);
      setData(res.data);
      setMsg("Saved ✓");
    } catch (e) {
      setErr(readErr(e));
    } finally {
      setSaving(false);
    }
  };

  if (!data && !err) return <div style={{padding:16}}>Loading…</div>;
  if (err && !data) return <div style={{padding:16, color:"crimson"}}>{err}</div>;

  const avatarSrc = makeMediaUrl(API_URL, data?.avatar);

  return (
    <div style={{maxWidth: 720, margin: "24px auto", padding: 16}}>
      <h1 style={{fontSize: 24, marginBottom: 12}}>My Profile</h1>

      <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <img
            src={avatarSrc || "/placeholder-avatar.png"}
            alt="avatar"
            style={{width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"1px solid #ddd"}}
            onError={(e)=>{ e.currentTarget.src = "/placeholder-avatar.png"; }}
          />
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        </div>

        <Field label="Full name">
          <input name="full_name" value={data.full_name || ""} onChange={onChange} style={input} />
        </Field>

        <Field label="Phone">
          <input name="phone" value={data.phone || ""} onChange={onChange} style={input} />
        </Field>

        <Field label="Location">
          <input name="location" value={data.location || ""} onChange={onChange} style={input} />
        </Field>

        <Field label="Bio">
          <textarea name="bio" rows={4} value={data.bio || ""} onChange={onChange} style={{...input, height:96}} />
        </Field>

        <div style={{display:"flex", gap:16, alignItems:"center"}}>
          <label style={{display:"flex", gap:8, alignItems:"center"}}>
            <input type="checkbox" name="notify_email" checked={!!data.notify_email} onChange={onChange} />
            <span>Email notifications</span>
          </label>
          <label style={{display:"flex", gap:8, alignItems:"center"}}>
            <input type="checkbox" name="notify_push" checked={!!data.notify_push} onChange={onChange} />
            <span>Push notifications</span>
          </label>
        </div>

        <div style={{fontSize:12, color:"#555"}}>
          Email (read-only): <b>{data.user?.email}</b>
        </div>

        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <button disabled={saving} style={btn}>{saving ? "Saving..." : "Save changes"}</button>
          {msg && <span style={{color:"green"}}>{msg}</span>}
          {err && <span style={{color:"crimson"}}>{err}</span>}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <div style={{fontSize:12, opacity:0.8}}>{label}</div>
      {children}
    </label>
  );
}

const input = { width:"100%", padding:"8px 10px", border:"1px solid #ddd", borderRadius:8 };
const btn = { padding:"8px 14px", border:"0", borderRadius:8, background:"#111", color:"#fff", cursor:"pointer" };

function readErr(e) {
  const d = e?.response?.data || e?.data || e;
  if (typeof d === "string") return d;
  if (d?.detail) return Array.isArray(d.detail) ? d.detail.join(", ") : String(d.detail);
  return e?.message || "Request failed";
}

function makeMediaUrl(API_URL, path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  // For dev with separate ports, make it absolute; otherwise relative works
  return API_URL ? `${API_URL.replace(/\/+$/,"")}${path}` : path;
}
