import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      return setError("Please fill in both fields.");
    }
    // TODO: call backend
    navigate("/");
  }

  return (
    <div className="center">
      <form className="form" onSubmit={onSubmit} noValidate>
        {/* Figma-style wordmark (crest + text) above the form */}
        <div className="brand-hero">
          <div className="brand-hero-img" aria-label="Lost Found" />
        </div>

        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            placeholder="you@aub.edu.lb"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <div style={{ color: "#b91c1c", fontSize: 13, margin: "6px 0" }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit">
          Log in
        </button>

        <div className="divider">Or</div>

        <Link className="btn btn-primary" to="/signup">
          Sign up
        </Link>
      </form>
    </div>
  );
}
