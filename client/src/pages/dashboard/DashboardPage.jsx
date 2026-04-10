import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

function DashboardPage() {
  const navigate = useNavigate();
  const { isSubmitting, logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-stack">
        <section className="dashboard-header">
          <div>
            <p className="dashboard-kicker">Authenticated workspace</p>
            <h1>{`Welcome, ${user?.name || 'builder'}`}</h1>
            <p>
              Your authentication layer is ready. Next we can build onboarding,
              student profiles, team matching, and project collaboration on top
              of it.
            </p>
          </div>

          <button
            className="secondary-button"
            disabled={isSubmitting}
            onClick={handleLogout}
            type="button"
          >
            {isSubmitting ? 'Signing out...' : 'Sign out'}
          </button>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <span className="dashboard-card__label">Account email</span>
            <strong>{user?.email}</strong>
            <p>This is the identity attached to your current session.</p>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card__label">Connected providers</span>
            <strong>
              {[
                user?.providers?.password ? 'Password' : null,
                user?.providers?.google ? 'Google' : null,
                user?.providers?.github ? 'GitHub' : null,
              ]
                .filter(Boolean)
                .join(', ') || 'None'}
            </strong>
            <p>Manual auth and social login are both supported here.</p>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card__label">Recommended next step</span>
            <strong>Student profile onboarding</strong>
            <p>
              That will let users describe their skills before you build team
              matching.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
