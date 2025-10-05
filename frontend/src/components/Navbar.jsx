// frontend/src/components/Navbar.jsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearUser } from "../utils/session";
import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/" || pathname === "/home";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  // helper for active styling
  const active = ({ isActive }) => (isActive ? "active" : "");

  return (
    <header className="topbar">
      <div className="bar">
        <div className="inner">
          {/* LEFT: brand (link to "/") */}
          <Link to="/" className="brand" aria-label="Lost & Found">
            <img src="/lostfound-dark.png" alt="lostfound" className="brand-img" />
          </Link>

          {/* Mobile toggle */}
          <div className="nav-toggle">
            <Hamburger
              toggled={open}
              toggle={setOpen}
              size={24}
              rounded
              label="Toggle navigation"
            />
          </div>

          {/* CENTER + RIGHT (mobile + desktop) */}
          <div className={`mobile-menu ${open ? "open" : ""}`}>
            {/* CENTER: menu */}
            <nav className="nav center-nav" onClick={() => setOpen(false)}>
              <NavLink to="/" end className={active}>
                Home
              </NavLink>
              <span className="sep" />
              <NavLink to="/about" className={active}>
                About
              </NavLink>
              <span className="sep" />
              <NavLink to="/lost" className={active}>
                Lost
              </NavLink>
              <span className="sep" />
              <NavLink to="/found" className={active}>
                Found
              </NavLink>
            </nav>

            {/* RIGHT: auth */}
            <div className="nav right" onClick={() => setOpen(false)}>
              {isHomePage ? (
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Log out
                </a>
              ) : (
                <Link to="/login">Log in</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
