import { Outlet } from 'react-router-dom';
import AdminNav from '../components/admin/AdminNav';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}