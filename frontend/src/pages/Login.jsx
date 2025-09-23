import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setUser, getUser } from "../utils/session";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.js";

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
      const resp = await api.post("/api/token/", {
        // Backend accepts username, but our serializer maps email->username if needed
        username: email,
        password: password
      });

      const { access, refresh } = resp.data;

      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);

      // Fetch user profile to get first_name and last_name
      try {
        const profileRes = await api.get("/api/users/profile/");
        setUser(profileRes.data);
      } catch {
        // Fallback if profile fetch fails
        setUser({ email });
      }

      navigate("/home");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
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
