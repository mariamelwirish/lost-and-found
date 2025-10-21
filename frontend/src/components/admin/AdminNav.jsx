import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  const getNavClass = ({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="admin-nav">
      <div className="admin-nav-header">
        <h2>Admin Panel</h2>
      </div>
      
      <div className="admin-nav-links">
        <NavLink to="/admin" end className={getNavClass}>
          Dashboard
        </NavLink>
        
        <NavLink to="/admin/users" className={getNavClass}>
          Users
        </NavLink>
        <NavLink to="/admin/posts" className={getNavClass}>
          Posts
        </NavLink>
      </div>

      <div className="admin-nav-footer">
        <NavLink to="/" className="btn admin-btn primary" style={{ width: 'auto' }}>
          Exit Admin Panel
        </NavLink>
      </div>
    </nav>
  );
}