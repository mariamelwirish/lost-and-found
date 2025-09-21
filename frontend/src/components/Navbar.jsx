import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="bar">
        <div className="inner">
          {/* LEFT: logo (link to "/") */}
          <Link to="/" className="brand" aria-label="Lost & Found">
  <img src="/lostfound-dark.png" alt="lostfound" className="brand-img" />
</Link>


          {/* CENTER: menu */}
          <nav className="nav center-nav">
            <NavLink to="/home">Home</NavLink>
            <span className="sep" />
            <NavLink to="/about">About</NavLink>
            <span className="sep" />
            <a className="disabled">Lost</a>
            <span className="sep" />
            <a className="disabled">Found</a>
          </nav>

          {/* RIGHT: auth */}
          <div className="nav right">
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
