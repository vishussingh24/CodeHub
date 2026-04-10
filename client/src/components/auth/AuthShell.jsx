import { Link } from 'react-router-dom';

function AuthShell({
  children,
  footerLinkLabel,
  footerLinkTo,
  footerText,
  introDescription,
  introPoints = [],
  introTitle,
  mode,
  subtitle,
  title,
}) {
  return (
    <main className="auth-shell">
      <div className="auth-shell__content">
        <section className="auth-shell__intro">
          {/* <img src="/codehub2.svg" alt="CodeHub logo" width="120" height="120" className="" /> */}
          <Link className="auth-shell__brand" to="/">
            CodeHub
          </Link>
          <p className="auth-shell__eyebrow">Student collaboration platform</p>
          <h1 className="auth-shell__title">{introTitle}</h1>
          <p className="auth-shell__copy">{introDescription}</p>

          <ul className="auth-shell__points">
            {introPoints.map((point) => (
              <li className="auth-shell__point" key={point}>
                <span className="auth-shell__point-mark" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <p className="auth-card__kicker">Welcome to CodeHub</p>

            <div className="auth-card__tabs" role="tablist" aria-label="Auth pages">
              <Link
                className={`auth-card__tab ${mode === 'login' ? 'auth-card__tab--active' : ''}`}
                to="/login"
              >
                Sign in
              </Link>
              <Link
                className={`auth-card__tab ${mode === 'signup' ? 'auth-card__tab--active' : ''}`}
                to="/signup"
              >
                Create account
              </Link>
            </div>

            <h2 className="auth-card__title">{title}</h2>
            <p className="auth-card__copy">{subtitle}</p>
          </div>

          {children}

          <p className="auth-card__footer">
            {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
