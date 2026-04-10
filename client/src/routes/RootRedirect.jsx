import { Navigate } from 'react-router-dom';

import PageLoader from '../components/common/PageLoader';
import { useAuth } from '../hooks/useAuth';

function RootRedirect() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PageLoader label="Loading your workspace..." />;
  }

  return <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />;
}

export default RootRedirect;
