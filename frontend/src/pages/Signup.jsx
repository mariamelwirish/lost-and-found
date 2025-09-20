import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", phone: "", password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function update(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password) {
      return setError("Please fill all required fields.");
    }
    // TODO: call backend; for now pretend success:
    navigate("/login");
  }

  return (
    <div className="center">
      <form className="card" onSubmit={onSubmit}>
        <h1 className="logo-lg">lostfound <span className="arrow">⇢</span></h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="field">
            <span>First Name</span>
            <input className="input" value={form.firstName} onChange={e=>update("firstName", e.target.value)} />
          </label>
          <label className="field">
            <span>Last Name</span>
            <input className="input" value={form.lastName} onChange={e=>update("lastName", e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Username</span>
          <input className="input" value={form.username} onChange={e=>update("username", e.target.value)} />
        </label>

        <label className="field">
          <span>Email</span>
          <input type="email" className="input" value={form.email} onChange={e=>update("email", e.target.value)} />
        </label>

        <label className="field">
          <span>Phone Number</span>
          <input className="input" value={form.phone} onChange={e=>update("phone", e.target.value)} />
        </label>

        <label className="field">
          <span>Password</span>
          <input type="password" className="input" value={form.password} onChange={e=>update("password", e.target.value)} />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary w-full" type="submit">Sign up</button>

        <div style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
