// frontend/src/components/Navbar.jsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearUser, getUser } from "../utils/session";
import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = getUser();

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
          {/* LEFT: brand (link to "/home") */}
          <Link to="/home" className="brand" aria-label="Lost & Found">
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
              <NavLink to="/home" className={active}>
                Home
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
              {user ? (
                <>
                  {user.is_staff && (
                    <>
                      <Link to="/admin" className="nav-link">Admin</Link>
                      <span className="sep" />
                    </>
                  )}
                  <NavLink to="/profile" className={active}>
                    Profile
                  </NavLink>
                  <span className="sep" />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    Logout
                  </a>
                </>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
