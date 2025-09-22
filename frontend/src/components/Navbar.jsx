import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearUser } from "../utils/session";

export default function Navbar() {
  const { pathname } = useLocation();
  // Treat both "/" and "/home" as the landing page
  const isHomePage = pathname === "/" || pathname === "/home";

  const navigate = useNavigate();
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
            <img src="/lostfound-dark.png" alt="lostfound" className="brand-img" />
          </Link>

          {/* CENTER: menu (kept simple so CSS centers it) */}
          <nav className="nav center-nav">
            <NavLink to="/">Home</NavLink>
            <span className="sep" />
            <NavLink to="/about">About</NavLink>
            <span className="sep" />
            <a className="disabled">Lost</a>
            <span className="sep" />
            <a className="disabled">Found</a>
          </nav>

          {/* RIGHT: Home ONLY shows Logout (plain text link); others show Login */}
          <div className="nav right">
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
    </header>
  );
}
