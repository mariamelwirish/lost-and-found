import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api";

export default function ResetPasswordConfirm() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from URL state (passed from ForgotPassword page)
  const email = location.state?.email;

  // If no email in state, redirect to forgot password page
  if (!email) {
    navigate("/forgot");
    return null;
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
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.password) {
        setError(err.response.data.password[0]);
      } else if (err.response?.data?.password2) {
        setError(err.response.data.password2[0]);
      } else {
        setError("Failed to reset password. Please try again.");
      }
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
          
          <Link className="btn btn-primary" to="/login">Go to Login</Link>
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

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="divider">Or</div>
        <Link className="btn btn-ghost" to="/login">Back to Log in</Link>
      </form>
    </div>
  );
}
