import { Navigate } from 'react-router-dom';
import { getUser } from '../../utils/session';

export default function AdminRoute({ children }) {
  const user = getUser();
  
  if (!user || !user.is_staff) {
    return <Navigate to="/home" replace />;
  }

  return children;
}