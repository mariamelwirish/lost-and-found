import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e){
    e.preventDefault();
    if(!email) return;
    // TODO: call your backend reset endpoint
    setSent(true);
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

        {sent && (
          <div className="error" style={{background:"#eefaf0", borderColor:"#c6efd1", color:"#245b2a"}}>
            If this email exists, a reset link was sent.
          </div>
        )}

        <button className="btn btn-primary" type="submit">Send reset link</button>

        <div className="divider">Or</div>
        <Link className="btn btn-ghost" to="/login">Back to Log in</Link>
      </form>
    </div>
  );
}
