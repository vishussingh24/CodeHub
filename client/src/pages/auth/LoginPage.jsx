import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import AuthField from '../../components/auth/AuthField';
import AuthShell from '../../components/auth/AuthShell';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../lib/utils/getApiErrorMessage';

const introPoints = [
];

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isBootstrapping, isSubmitting, login, providers } = useAuth();

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const oauthErrorMessage = searchParams.get('error') || '';

  useEffect(() => {
    if (oauthErrorMessage) {
      setFormError(oauthErrorMessage);
    }
  }, [oauthErrorMessage]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    try {
      await login(formValues);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'We could not sign you in right now.')
      );
    }
  }

  return (
    <AuthShell
      footerLinkLabel="Create one"
      footerLinkTo="/signup"
      footerText="Need a new account?"
      introPoints={introPoints}
      introTitle="Find the right team and keep building."
      mode="login"
      title="Welcome back"
    >
      {formError ? <div className="form-alert">{formError}</div> : null}

      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField
          autoComplete="email"
          label="Email address"
          name="email"
          onChange={handleChange}
          placeholder="you@example.com"
          required
          type="email"
          value={formValues.email}
        />

        <AuthField
          autoComplete="current-password"
          label="Password"
          name="password"
          onChange={handleChange}
          placeholder="Enter your password"
          required
          type="password"
          value={formValues.password}
        />

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing you in...' : 'Sign in'}
        </button>
      </form>

      <SocialAuthButtons
        isLoading={isBootstrapping}
        providers={providers}
      />
    </AuthShell>
  );
}

export default LoginPage;
