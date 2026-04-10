import { Navigate, Outlet, useLocation } from 'react-router-dom';

import PageLoader from '../components/common/PageLoader';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PageLoader label="Preparing your dashboard..." />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: location.pathname }} to="/login" />
  );
}

export default ProtectedRoute;
