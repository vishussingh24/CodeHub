import { render, screen } from '@testing-library/react';

import LoginPage from './pages/auth/LoginPage';

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useLocation: () => ({ pathname: '/login', state: {} }),
    useNavigate: () => jest.fn(),
    useSearchParams: () => [new URLSearchParams()],
  }),
  { virtual: true }
);

jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    isBootstrapping: false,
    isSubmitting: false,
    login: jest.fn(),
    providers: {
      google: true,
      github: true,
    },
  }),
}));

test('renders the login experience', async () => {
  render(<LoginPage />);
  expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
});
