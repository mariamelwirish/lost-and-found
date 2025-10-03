import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearUser } from "../utils/session";
import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";

export default function Navbar() {
  const { pathname } = useLocation();
  // Treat both "/" and "/home" as the landing page
  const isHomePage = pathname === "/" || pathname === "/home";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = () => {
    // Remove the saved user used by the Home greeting
    clearUser();
    // (Optional) also clear your auth token/cookies, if any:
    // localStorage.removeItem("token");
    // document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="bar">
        <div className="inner">
          {/* LEFT: brand (link to "/") */}
          <Link to="/" className="brand" aria-label="Lost & Found">
            <img
              src="/lostfound-dark.png"
              alt="lostfound"
              className="brand-img"
            />
          </Link>

          {/* Mobile View */}
          <div className="nav-toggle">
            <Hamburger
              toggled={open}
              toggle={setOpen}
              size={24}
              rounded
              label="Toggle navigation"
            />
          </div>

          {/* CENTER: menu (kept simple so CSS centers it) */}
          <div className={`mobile-menu ${open ? "open" : ""}`}>
            <nav className="nav center-nav" onClick={() => setOpen(false)}>
              <NavLink to="/">Home</NavLink>
              <span className="sep" />
              <NavLink to="/about">About</NavLink>
              <span className="sep" />
              <a className="disabled">Lost</a>
              <span className="sep" />
              <a className="disabled">Found</a>
            </nav>

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
