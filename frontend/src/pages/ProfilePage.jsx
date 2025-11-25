import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { setUser, clearUser } from "../utils/session";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  // password-reset flow state
  const [pwStage, setPwStage] = useState(0); // 0=idle,1=code-sent,2=enter-code
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwCode, setPwCode] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwCooldown, setPwCooldown] = useState(0); // seconds before resend
  const [editingInfo, setEditingInfo] = useState(false);
  const navigate = useNavigate();

  const formatErrorMessage = (error, fallback = "Something went wrong.") => {
    const data = error?.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.join(" ");
    if (typeof data === "object") {
      if (typeof data.detail === "string") return data.detail;
      if (typeof data.error === "string") return data.error;
      return Object.entries(data)
        .map(([key, value]) => {
          const prettyKey = key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
          const val = Array.isArray(value) ? value.join(", ") : value;
          return `${prettyKey}: ${typeof val === "string" ? val : JSON.stringify(val)}`;
        })
        .join(" ");
    }
    return fallback;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/users/profile/");
        const data = res.data || res;
        if (!alive) return;
        setForm({
          id: data.id,
          username: data.username || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
        });
        setErr("");
      } catch (e) {
        console.error(e);
        setErr("Failed to load profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const updateField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const displayName = useMemo(() => {
    const full = [form.first_name, form.last_name].filter(Boolean).join(" ");
    return full || form.username || "Profile";
  }, [form.first_name, form.last_name, form.username]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const payload = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      };
      const res = await api.patch("/api/users/profile/", payload);
      const updated = res.data || res;
      setUser(updated);
      setMsg("Profile updated successfully.");
      setEditingInfo(false);
    } catch (e) {
      console.error(e);
      setErr(formatErrorMessage(e, "Failed to update profile."));
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Password reset (reuse existing flow): request code then submit code+new password
  const requestPasswordCode = async () => {
    setPwLoading(true);
    setPwErr("");
    setPwMsg("");
    try {
      await api.post("/api/users/request-password-reset/", { email: form.email });
      setPwStage(1);
      setPwMsg("Verification code sent to your email. Enter it below.");
      setPwCooldown(60); // 1 minute before allowing another code
    } catch (e) {
      console.error(e);
      setPwErr(formatErrorMessage(e, "Failed to send code."));
    } finally {
      setPwLoading(false);
    }
  };

  // Countdown for resend button in profile password section
  useEffect(() => {
    if (pwCooldown <= 0) return;
    const id = setInterval(() => {
      setPwCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [pwCooldown]);

  const submitNewPassword = async () => {
    setPwLoading(true);
    setPwErr("");
    setPwMsg("");
    try {
      await api.post("/api/users/reset-password/", {
        email: form.email,
        code: pwCode,
        password: pw1,
        password2: pw2,
      });
      setPwMsg("Password updated. Please log in again.");
      // clear local session so user logs in with new password
      clearUser();
      // optional: redirect to login page — leave client to navigate
      setPwStage(2);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
      setPwErr(formatErrorMessage(e, "Failed to reset password."));
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container profile-page">
        <div className="card" style={{ padding: 32, textAlign: "center" }}>Loading profile…</div>
      </main>
    );
  }

  const renderInput = ({ id, locked, hint, label, type = "text", ...rest }) => {
    const isLocked = locked || id === "email";
    const readOnly = !editingInfo || isLocked;
    return (
      <input
        {...rest}
        id={id}
        type={type}
        className={`profile-input${readOnly ? " profile-input--readonly" : ""}`}
        readOnly={readOnly}
        disabled={isLocked}
      />
    );
  };

  const fieldConfig = [
    {
      id: "username",
      label: "Username",
      value: form.username,
      onChange: (e) => updateField("username", e.target.value),
    },
    {
      id: "phone",
      label: "Phone",
      type: "tel",
      value: form.phone,
      onChange: (e) => updateField("phone", e.target.value),
    },
    {
      id: "first_name",
      label: "First name",
      value: form.first_name,
      onChange: (e) => updateField("first_name", e.target.value),
    },
    {
      id: "last_name",
      label: "Last name",
      value: form.last_name,
      onChange: (e) => updateField("last_name", e.target.value),
    },
    {
      id: "email",
      label: "Email",
      value: form.email,
      locked: true,
      hint: "Email changes require contacting support.",
      span: 2,
    },
  ];

  const securityFields = [
    {
      id: "pwCode",
      label: "Confirmation code",
      type: "text",
      value: pwCode,
      onChange: (e) => setPwCode(e.target.value),
      span: 2,
    },
    {
      id: "pw1",
      label: "New password",
      type: "password",
      value: pw1,
      onChange: (e) => setPw1(e.target.value),
    },
    {
      id: "pw2",
      label: "Confirm new password",
      type: "password",
      value: pw2,
      onChange: (e) => setPw2(e.target.value),
    },
  ];

  return (
    <main className="container profile-page">
      <div className="profile-layout">
        <section className="profile-main">
          <div className="card" style={{ padding: 32 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#8b809b" }}>Account overview</p>
                <h2 style={{ margin: "6px 0 0", fontSize: 30 }}>{displayName}</h2>
              </div>
              <button
                type="button"
                className="btn-pill"
                onClick={() => {
                  if (editingInfo) {
                    setEditingInfo(false);
                    setMsg("");
                    setErr("");
                  } else {
                    setEditingInfo(true);
                  }
                }}
              >
                {editingInfo ? "Cancel" : "Edit info"}
              </button>
            </header>

            {err && <div className="error" style={{ marginTop: 16 }}>{err}</div>}
            {msg && <div style={{ marginTop: 16, color: "#0f8d6d", fontWeight: 600 }}>{msg}</div>}

            <form onSubmit={handleSave} style={{ marginTop: 24 }}>
              <div className="profile-grid">
                {fieldConfig.map((field) => {
                  const classes = ["profile-field"];
                  if (field.locked) classes.push("profile-field--locked");
                  if (editingInfo && !field.locked) classes.push("profile-field--editing");
                  if (field.span) classes.push(`profile-field--span-${field.span}`);
                  return (
                    <div key={field.id} className={classes.join(" ")}>
                      <label className="profile-label" htmlFor={field.id}>{field.label}</label>
                      {renderInput(field)}
                      {field.hint && <p className="profile-hint">{field.hint}</p>}
                    </div>
                  );
                })}
              </div>

              {editingInfo && (
                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn-pill" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="btn-pill btn-pill--ghost"
                    onClick={() => {
                      setEditingInfo(false);
                      setMsg("");
                      setErr("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            <hr style={{ margin: "28px 0" }} />

            <section>
              <header>
                <p style={{ margin: 0, fontSize: 14, color: "#888" }}>Security</p>
                <h3 style={{ margin: "4px 0 12px" }}>Change password</h3>
              </header>
              {pwErr && <div className="error" style={{ marginBottom: 12 }}>{pwErr}</div>}
              {pwMsg && <div style={{ marginBottom: 12, color: "#0f8d6d", fontWeight: 600 }}>{pwMsg}</div>}

              {pwStage === 0 && (
                <div>
                  <p style={{ marginBottom: 12 }}>To update your password we will email you a confirmation code.</p>
                  <button
                    type="button"
                    className="btn-pill"
                    onClick={requestPasswordCode}
                    disabled={pwLoading || !form.email || pwCooldown > 0}
                  >
                    {pwLoading
                      ? "Sending…"
                      : pwCooldown > 0
                        ? `You can request again in ${Math.floor(pwCooldown / 60)}:${String(pwCooldown % 60).padStart(2, "0")}`
                        : "Request confirmation code"}
                  </button>
                </div>
              )}

              {pwStage === 1 && (
                <>
                  <div className="profile-grid profile-grid--security">
                    {securityFields.map((field) => (
                      <div
                        key={field.id}
                        className={[
                          "profile-field",
                          "profile-field--editing",
                          "profile-field--security",
                          field.span ? `profile-field--span-${field.span}` : "",
                        ].join(" ").trim()}
                      >
                        <label className="profile-label" htmlFor={field.id}>{field.label}</label>
                        <input
                          id={field.id}
                          type={field.type}
                          className="profile-input"
                          value={field.value}
                          onChange={field.onChange}
                          autoComplete="off"
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                    <button type="button" className="btn-pill" onClick={submitNewPassword} disabled={pwLoading || !pwCode || !pw1 || !pw2}>
                      {pwLoading ? "Submitting…" : "Submit new password"}
                    </button>
                    <button
                      type="button"
                      className="btn-pill btn-pill--ghost"
                      onClick={() => {
                        setPwStage(0);
                        setPwCode("");
                        setPw1("");
                        setPw2("");
                        setPwErr("");
                        setPwMsg("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {pwStage === 2 && (
                <p style={{ marginTop: 12 }}>Password updated. Please sign in again with the new password.</p>
              )}
            </section>
          </div>
        </section>

        <aside className="profile-side">
          <div className="card" style={{ padding: 20, background: "#f9f5ff" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>My Found Posts</h4>
            <p style={{ margin: "0 0 16px", color: "#555" }}>Jump straight to the list of items you found and reported.</p>
            <Link to="/found/mine" className="btn-pill btn-pill--block">
              Go to My Found Posts
            </Link>
          </div>

          <div className="card" style={{ padding: 20, background: "#f9f5ff" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>My Lost Posts</h4>
            <p style={{ margin: "0 0 16px", color: "#555" }}>Manage the items you reported as lost in one place.</p>
            <Link to="/lost/mine" className="btn-pill btn-pill--block">
              Go to My Lost Posts
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
