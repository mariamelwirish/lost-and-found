import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../utils/session"; // <-- store user for Home greeting

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", phone: "", password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function update(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const firstName = form.firstName.trim();
    const lastName  = form.lastName.trim();
    const username  = form.username.trim();
    const email     = form.email.trim();
    const phone     = form.phone.trim();
    const password  = form.password; // keep as-is

    // quick front-end validation
    if (!firstName || !lastName || !username || !email || !password) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      // TODO: replace with your real API call
      // const res = await axios.post("/api/signup", { firstName, lastName, username, email, phone, password });
      // const data = res?.data?.user ?? res?.data ?? res;

      // Save WHAT WE WANT TO GREET WITH:
      setUser({
        name: `${firstName} ${lastName}`.trim(),
        username,        // <-- this is the display you want
        email,
        phone
      });

      // Go to Home so you see: "Welcome, <username>"
      navigate("/home"); // use "/" if your home route is "/"
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
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
