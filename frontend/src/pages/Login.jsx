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
    // simulate success
    navigate("/home");
  }

  return (
    <div className="center">
      <form className="form" onSubmit={onSubmit}>

        {/* wordmark */}
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
  onChange={e => setEmail(e.target.value)}
/>

        </label>

        <label className="field">
  <span>Password</span>
  <input
    type="password"
    placeholder="********"
    className="input"
    value={password}
    onChange={e=>setPassword(e.target.value)}
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
