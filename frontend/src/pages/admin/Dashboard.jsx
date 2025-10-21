import { useState, useEffect } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    lostItems: 0,
    foundItems: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Implement API endpoint for stats
        const response = await api.get('/api/admin/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
          <Link to="/admin/users" className="stat-link">Manage Users →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Posts</h3>
          <p className="stat-number">{stats.totalPosts}</p>
          <Link to="/admin/posts" className="stat-link">View All Posts →</Link>
        </div>

        <div className="stat-card">
          <h3>Lost Items</h3>
          <p className="stat-number">{stats.lostItems}</p>
         <Link to="/admin/posts?kind=lost" className="stat-link">View Lost Items →</Link>
        </div>

        <div className="stat-card">
          <h3>Found Items</h3>
          <p className="stat-number">{stats.foundItems}</p>
         <Link to="/admin/posts?kind=found" className="stat-link">View Found Items →</Link>
        </div>
      </div>

      <div className="quick-actions" style={{ marginTop: 24 }}>
        <h2>Quick Actions</h2>
        <div className="action-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          <Link to="/my-posts/create" state={{ type: 'lost' }} className="admin-btn primary">Create Lost</Link>
          <Link to="/my-posts/create" state={{ type: 'found' }} className="admin-btn ghost">Create Found</Link>
          <Link to="/admin/users?add=1" className="admin-btn neutral">Add User</Link>
        </div>
      </div>
    </div>
  );
}