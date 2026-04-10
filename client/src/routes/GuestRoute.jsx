import { Navigate, Outlet } from 'react-router-dom';

import PageLoader from '../components/common/PageLoader';
import { useAuth } from '../hooks/useAuth';

function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PageLoader label="Checking your session..." />;
  }

  return isAuthenticated ? <Navigate replace to="/dashboard" /> : <Outlet />;
}

export default GuestRoute;
