import { API_BASE_URL } from '../../lib/api/client';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.8 4.8 0 0 1-2 3.2v2.7h3.2c1.9-1.7 3.1-4.4 3.1-7.7Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-0.9 6.7-2.5l-3.2-2.7c-0.9 0.6-2.1 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2H3v2.8A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.3 13.6A6 6 0 0 1 6 12c0-.6.1-1.1.3-1.6V7.6H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.4l3.3-2.8Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.2c1.4 0 2.7.5 3.8 1.4l2.8-2.8A10 10 0 0 0 3 7.6l3.3 2.8c.8-2.4 3-4.2 5.7-4.2Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.6-1.3-1.4-1.7-1.4-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.2 1.2a10.7 10.7 0 0 1 5.8 0C17.9 5.1 19 5.4 19 5.4c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.8 5.5-5.5 5.8.4.4.8 1 .8 2v3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"
        fill="currentColor"
      />
    </svg>
  );
}

const providersList = [
  {
    id: 'google',
    label: 'Continue with Google',
    Icon: GoogleIcon,
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    Icon: GithubIcon,
  },
];

function SocialAuthButtons({ isLoading, providers }) {
  const allProvidersUnavailable =
    !isLoading && !providers.google && !providers.github;

  return (
    <div className="social-auth">
      <div className="social-auth__divider">
        <span>or continue with</span>
      </div>

      <div className="social-auth__list">
        {providersList.map(({ id, label, Icon }) => {
          const isEnabled = Boolean(providers[id]);

          return (
            <button
              key={id}
              className="social-auth__button"
              disabled={!isEnabled}
              onClick={() =>
                window.location.assign(`${API_BASE_URL}/auth/oauth/${id}/start`)
              }
              type="button"
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      
    </div>
  );
}

export default SocialAuthButtons;
