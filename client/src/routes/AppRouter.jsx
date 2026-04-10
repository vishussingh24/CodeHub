import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import RootRedirect from './RootRedirect';

function AppRouter() {
  return (
    <Routes>
      <Route element={<RootRedirect />} path="/" />
      <Route element={<OAuthCallbackPage />} path="/auth/callback" />

      <Route element={<GuestRoute />}>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignupPage />} path="/signup" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardPage />} path="/dashboard" />
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default AppRouter;
