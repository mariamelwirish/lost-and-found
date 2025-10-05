// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="lf-nav">
      {/* Left: logo */}
      <div className="nav left">
        <Link to="/" className="brand" aria-label="Home">
          <img src="/lostfound-dark.png" alt="lostfound" className="brand-logo" />
        </Link>
      </div>

      {/* Center: menu */}
      <nav className="nav center-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Home</NavLink>
        <span className="sep" />
        <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>About</NavLink>
        <span className="sep" />
        <NavLink to="/lost" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Lost</NavLink>
        <span className="sep" />
        <NavLink to="/found" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Found</NavLink>
      </nav>

      {/* Right: Login/Logout */}
      <div className="nav right">
        <Link to="/login" replace className="nav-link">Log out</Link>
      </div>
    </header>
  );
}
