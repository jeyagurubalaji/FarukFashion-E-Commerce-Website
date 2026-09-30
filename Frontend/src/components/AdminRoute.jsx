import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loader" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.role || (user?.roles && user.roles[0]);
  if (role !== 'ADMIN' && !(Array.isArray(user?.roles) && user.roles.includes('ADMIN'))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
