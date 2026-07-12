import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/auth-context';

// Guards a route. Redirects guests to /login. If `role` is given and the
// authenticated user has a different role, sends them to their own dashboard.
const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const home = user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
