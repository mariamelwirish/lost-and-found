// frontend/src/layouts/AppLayout.jsx
import Navbar from "../components/Navbar";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom"; // <-- Link added

export default function AppLayout() {
  const { pathname } = useLocation();

  // Show the tabs on Lost/Found sections (including /mine)
  const showTabs = pathname.startsWith("/lost") || pathname.startsWith("/found");

  // Are we currently in Lost or Found?
  const base = pathname.startsWith("/found") ? "found" : "lost";

  return (
    <>
      <Navbar />

      {showTabs && (
        <div className="subnav">
          <div className="subnav-inner">
            {/* Everyone's posts */}
            <NavLink
              to={`/${base}`}
              end
              className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
              Posts
            </NavLink>

            {/* Only my posts */}
            <NavLink
              to={`/${base}/mine`}
              className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
              My Posts
            </NavLink>
          </div>
        </div>
      )}

      <Outlet />

      {/* Floating Create Post (only on Lost/Found pages) */}
      {showTabs && (
        <div className="fab-wrap">
          <Link to="/my-posts/create" className="fab" aria-label="Create Post">
            <span className="fab-plus">+</span>
          </Link>
          <div className="fab-label">Create Post</div>
        </div>
      )}
    </>
  );
}
