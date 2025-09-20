import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="bar">
        <div className="inner">
          {/* LEFT: logo (keeps going to "/" which is Login now) */}
          <Link to="/" className="brand">
            <img src="/crest.png" alt="Lost & Found" className="brand-img" />
          </Link>

          {/* CENTER: menu (Home now points to /home) */}
          <nav className="nav center-nav">
            <NavLink to="/home">Home</NavLink>
            <span className="sep" />
            <a className="disabled">About</a>
            <span className="sep" />
            <a className="disabled">Lost</a>
            <span className="sep" />
            <a className="disabled">Found</a>
          </nav>

          {/* RIGHT: auth link goes to /login */}
          <div className="nav right">
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
