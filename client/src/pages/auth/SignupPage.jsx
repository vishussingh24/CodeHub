import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthField from '../../components/auth/AuthField';
import AuthShell from '../../components/auth/AuthShell';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../lib/utils/getApiErrorMessage';

const introPoints = [
  'Create a secure account in a few seconds.',
  'Connect Google or GitHub whenever the provider keys are enabled.',
  'Set up the base identity for your future student profile.',
];

function SignupPage() {
  const navigate = useNavigate();
  const { isBootstrapping, isSubmitting, providers, signup } = useAuth();

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

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
      await signup(formValues);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'We could not create your account right now.')
      );
    }
  }

  return (
    <AuthShell
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
      footerText="Already have an account?"
      introTitle="Start building your student network."
      mode="signup"
      title="Create account"
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
          autoComplete="new-password"
          label="Password"
          name="password"
          onChange={handleChange}
          placeholder="Create a strong password"
          required
          type="password"
          value={formValues.password}
        />

        

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating your account...' : 'Create account'}
        </button>
      </form>

      <SocialAuthButtons
        isLoading={isBootstrapping}
        providers={providers}
      />
    </AuthShell>
  );
}

export default SignupPage;
