import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    if(!email) return;
    
    setLoading(true);
    setError("");
    
    try {
      await api.post("/api/users/request-password-reset/", {
        email: email
      });
      // Redirect to confirmation page with email in state
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to send reset email. Please try again.");
      }
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center">
      <form className="form" onSubmit={onSubmit}>
        <div className="brand-hero">
          <img src="/lostfound.png" alt="lostfound" className="brand-hero-logo" />
        </div>

        <h2 style={{margin:"0 0 6px", fontSize:18}}>Reset your password</h2>
        <p style={{margin:"0 0 14px", fontSize:13, color:"#555"}}>
          Enter your email and we’ll send you a reset link.
        </p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@aub.edu.lb"
            className="input"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
        </label>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {sent && (
          <div className="error" style={{background:"#eefaf0", borderColor:"#c6efd1", color:"#245b2a"}}>
            If this email exists, a reset link was sent.
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
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <div className="divider">Or</div>
        <Link className="btn btn-ghost" to="/login">Back to Log in</Link>
      </form>
    </div>
  );
}
