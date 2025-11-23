import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api";

function extractErrorMessage(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) return payload[0];
  if (typeof payload === "object") {
    const preferredKeys = [
      "detail",
      "error",
      "message",
      "non_field_errors",
      "password",
      "password2",
      "code"
    ];
    for (const key of preferredKeys) {
      const value = payload[key];
      if (!value) continue;
      if (Array.isArray(value)) return value[0];
      if (typeof value === "string") return value;
    }
    const firstValue = Object.values(payload).find(Boolean);
    if (firstValue) {
      if (Array.isArray(firstValue)) return firstValue[0];
      if (typeof firstValue === "string") return firstValue;
    }
  }
  return "";
}

export default function ResetPasswordConfirm() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const initialCooldown = location.state?.startCooldown ? 60 : 0;
  const [resendCooldown, setResendCooldown] = useState(initialCooldown); // seconds
  
  const navigate = useNavigate();
  
  // Get email from URL state (passed from ForgotPassword page)
  const email = location.state?.email;

  // If no email in state, redirect to forgot password page
  if (!email) {
    navigate("/forgot");
    return null;
  }

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  async function handleResendCode() {
    if (!email) return;
    setError("");
    try {
      await api.post("/api/users/request-password-reset/", { email });
      setResendCooldown(60); // 1 minute in seconds
    } catch (err) {
      const serverMessage = extractErrorMessage(err.response?.data);
      setError(serverMessage || "We couldn't resend the code. Please try again in a moment.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    
    if (!code || !password || !password2) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await api.post("/api/users/reset-password/", {
        email: email,
        code: code,
        password: password,
        password2: password2
      });
      setSuccess(true);
    } catch (err) {
      const serverMessage = extractErrorMessage(err.response?.data);
      setError(
        serverMessage ||
          "We couldn't reset your password. Double-check the verification code and try again."
      );
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="center">
        <div className="form">
          <div className="brand-hero">
            <img src="/lostfound.png" alt="lostfound" className="brand-hero-logo" />
          </div>
          
          <h2 style={{margin:"0 0 6px", fontSize:18}}>Password Reset Successful</h2>
          <p style={{margin:"0 0 14px", fontSize:13, color:"#555"}}>
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          
          <div className="error" style={{background:"#eefaf0", borderColor:"#c6efd1", color:"#245b2a"}}>
            Password updated successfully!
          </div>
          
          <Link 
            className="btn btn-primary" 
            to="/login"
            style={{ 
              background: '#9C81A8', 
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.target.style.background = '#c4b0cd'}
            onMouseLeave={(e) => e.target.style.background = '#9C81A8'}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="center">
      <form className="form" onSubmit={onSubmit}>
        <div className="brand-hero">
          <img src="/lostfound.png" alt="lostfound" className="brand-hero-logo" />
        </div>

        <h2 style={{margin:"0 0 6px", fontSize:18}}>Reset your password</h2>
        <p style={{margin:"0 0 14px", fontSize:13, color:"#555"}}>
          Enter the verification code sent to <strong>{email}</strong> and your new password.
          The code is valid for 1 minute.
        </p>

        <label className="field">
          <span>Verification Code</span>
          <input
            type="text"
            placeholder="123456"
            className="input"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            required
          />
        </label>

        <label className="field">
          <span>New Password</span>
          <input
            type="password"
            placeholder="********"
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <label className="field">
          <span>Confirm New Password</span>
          <input
            type="password"
            placeholder="********"
            className="input"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#9C81A8', 
            transition: 'all 0.2s ease' 
          }}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#c4b0cd')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#9C81A8')}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div style={{ marginTop: 12, fontSize: 13, textAlign: "center" }}>
          {resendCooldown > 0 ? (
            <span style={{ color: "#555" }}>
              You can request a new code in {Math.floor(resendCooldown / 60)}:
              {String(resendCooldown % 60).padStart(2, "0")} minutes.
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
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

        <div className="divider">Or</div>
        <Link className="btn btn-ghost" to="/login">Back to Log in</Link>
      </form>
    </div>
  );
}
