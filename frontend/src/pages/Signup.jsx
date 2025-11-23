import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../utils/session";
import api from "../api";

// Password rule helpers (frontend guidance only)
const PASSWORD_RULES = [
  { label: "8+ characters", test: s => (s || "").length >= 8 },
  { label: "Uppercase",      test: s => /[A-Z]/.test(s || "") },
  { label: "Lowercase",      test: s => /[a-z]/.test(s || "") },
  { label: "Digit",          test: s => /\d/.test(s || "") },
  { label: "Special char",   test: s => /[^\w\s]/.test(s || "") },
];

const passesAllRules = s => PASSWORD_RULES.every(r => r.test(s));

function PasswordHints({ password }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0 0", fontSize: 12 }}>
      {PASSWORD_RULES.map(r => (
        <li key={r.label}>
          {r.test(password) ? "✓" : "•"} {r.label}
        </li>
      ))}
    </ul>
  );
}

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", phone: "", password: "", password2: ""
  });
  const [step, setStep] = useState(1); // 1: form, 2: verify code
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const navigate = useNavigate();
  const strong = passesAllRules(form.password);

  // Countdown for resend button when on step 2
  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step, resendCooldown]);

  function update(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSendCode() {
    const { firstName, lastName, username, email, phone, password, password2 } = form;

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    if (!strong) {
      setError("Use a stronger password");
      return;
    }

    try {
      await api.post("/api/users/send-code/", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
        password2
      });
      setStep(2);
      setError("");
      setResendCooldown(60); // 1 minute in seconds
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors = [];
        if (errorData.email) errors.push(`Email: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`);
        if (errorData.username) errors.push(`Username: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`);
        if (errorData.phone) errors.push(`Phone: ${Array.isArray(errorData.phone) ? errorData.phone.join(', ') : errorData.phone}`);
        if (errorData.password) errors.push(`Password: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`);
        if (errorData.password2) errors.push(`Password confirmation: ${Array.isArray(errorData.password2) ? errorData.password2.join(', ') : errorData.password2}`);
        if (errorData.non_field_errors) errors.push(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors);

        setError(errors.length > 0 ? errors.join(' ') : errorData.detail || "Failed to send verification code.");
      } else {
        setError("Failed to send verification code.");
      }
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (step === 1) {
      // Step 1: Send verification code
      await handleSendCode();
    } else {
      // Step 2: Verify code and create account
      if (!verificationCode.trim()) {
        setError("Please enter the verification code.");
        return;
      }

      try {
        const response = await api.post("/api/users/verify-code/", {
          email: form.email.trim(),
          code: verificationCode.trim()
        });

        setUser({
          name: `${form.firstName} ${form.lastName}`.trim(),
          username: form.username,
          email: form.email,
          phone: form.phone
        });

        navigate("/login");
      } catch (err) {
        setError(err.response?.data?.error || "Verification failed.");
      }
    }
  }

  if (step === 2) {
    return (
      <div className="center">
        <form className="form" onSubmit={onSubmit}>
          <div className="brand-hero">
            <img src="/lostfound.png" alt="lostfound" className="brand-hero-logo" />
          </div>

          <h2>Verify Your Email</h2>
          <p>
            We sent a 6-digit code to {form.email}.<br />
            It is valid for 1 minute.
          </p>

          <label className="field">
            <span>Verification Code</span>
            <input
              className="input"
              placeholder="123456"
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </label>

          {error && <div className="error" role="alert" aria-live="polite">{error}</div>}

          <button 
            className="btn btn-primary w-full" 
            type="submit"
            style={{ 
              background: '#9C81A8', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => e.target.style.background = '#c4b0cd'}
            onMouseLeave={(e) => e.target.style.background = '#9C81A8'}
          >
            Verify & Create Account
          </button>

          <div style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
            {resendCooldown > 0 ? (
              <span style={{ color: "#555" }}>
                You can request a new code in {Math.floor(resendCooldown / 60)}:
                {String(resendCooldown % 60).padStart(2, "0")} minutes.
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendCode}
                style={{
                  marginTop: 4,
                  background: "#ffffff",
                  border: "1px solid #9C81A8",
                  color: "#9C81A8",
                  cursor: "pointer",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  fontSize: 13,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f1e9f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#ffffff";
                }}
              >
                Resend verification code
              </button>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
            <button 
              type="button" 
              onClick={() => {
                setStep(1);
                setResendCooldown(0);
              }} 
              style={{ 
                background: "#9C81A8", 
                border: "none", 
                color: "white", 
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = '#c4b0cd'}
              onMouseLeave={(e) => e.target.style.background = '#9C81A8'}
            >
              Back to form
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="center">
      <form className="form" onSubmit={onSubmit}>
        <div className="brand-hero">
          <img src="/lostfound.png" alt="lostfound" className="brand-hero-logo" />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          <label className="field">
            <span>First Name</span>
            <input
              className="input"
              value={form.firstName}
              onChange={e=>update("firstName", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Last Name</span>
            <input
              className="input"
              value={form.lastName}
              onChange={e=>update("lastName", e.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Username</span>
          <input
            className="input"
            value={form.username}
            onChange={e=>update("username", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            className="input"
            placeholder="you@aub.edu.lb or you@mail.aub.edu"
            value={form.email}
            onChange={e=>update("email", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Phone Number</span>
          <input
            className="input"
            value={form.phone}
            onChange={e=>update("phone", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={e=>update("password", e.target.value)}
          />
          <PasswordHints password={form.password} />
        </label>

        <label className="field">
          <span>Confirm Password</span>
          <input
            type="password"
            className="input"
            value={form.password2}
            onChange={e=>update("password2", e.target.value)}
          />
        </label>

        {error && <div className="error" role="alert" aria-live="polite">{error}</div>}

        <button 
          className="btn btn-primary w-full" 
          type="submit"
          style={{ 
            background: '#9C81A8', 
            transition: 'all 0.2s ease' 
          }}
          onMouseEnter={(e) => e.target.style.background = '#c4b0cd'}
          onMouseLeave={(e) => e.target.style.background = '#9C81A8'}
        >
          Send Verification Code
        </button>

        <div style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
