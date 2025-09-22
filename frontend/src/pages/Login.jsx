import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setUser, getUser } from "../utils/session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      // TODO: call your real backend here and use the returned user object.
      // For now, DO NOT overwrite username; just update email.
      const existing = getUser() || {};
      setUser({
        ...existing,
        email,         // update email
        // keep existing.name / existing.username if they already exist
      });

      navigate("/home"); // or "/" if your home route is "/"
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  }

  return (
    <div className="center">
      <form className="form" onSubmit={onSubmit}>
        <div className="brand-hero">
          <img src="/lostfound.png" alt="lostfound" className="brand-hero-logo" />
        </div>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@mail.aub.edu or you@aub.edu.lb"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="********"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="form-foot">
          <Link to="/forgot">Forgot password?</Link>
        </div>

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary" type="submit">Log in</button>

        <div className="divider">Or</div>

        <Link className="btn btn-primary" to="/signup">Sign up</Link>
      </form>
    </div>
  );
}
