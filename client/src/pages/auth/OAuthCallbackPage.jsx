import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PageLoader from '../../components/common/PageLoader';
import { useAuth } from '../../hooks/useAuth';

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [statusMessage, setStatusMessage] = useState(
    'Completing your sign-in...'
  );

  const status = searchParams.get('status');
  const message = searchParams.get('message');

  useEffect(() => {
    let isActive = true;

    async function finalizeOAuth() {
      if (status === 'success') {
        setStatusMessage('Social account connected. Loading your workspace...');

        try {
          await refreshUser();
          if (isActive) {
            navigate('/dashboard', { replace: true });
          }
          return;
        } catch (error) {
          if (isActive) {
            navigate('/login?error=Your session could not be restored.', {
              replace: true,
            });
          }
          return;
        }
      }

      const redirectMessage =
        message || 'We could not complete your social sign-in.';
      navigate(`/login?error=${encodeURIComponent(redirectMessage)}`, {
        replace: true,
      });
    }

    finalizeOAuth();

    return () => {
      isActive = false;
    };
  }, [message, navigate, refreshUser, status]);

  return <PageLoader label={statusMessage} />;
}

export default OAuthCallbackPage;
