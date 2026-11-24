import { Navigate, Outlet } from "react-router";

import useAuth from "../features/auth/hooks/useAuth";
import { GlobalLoading } from "../features/components/Loading";
import { customConsoleLogForDev } from "../shared/logHelpers/logger";

// Guards login and register: only people who are NOT logged in may see them.
const AuthRoute = () => {
  const { authLoading, isLoggedIn } = useAuth();

  // Still checking the refresh token, so wait before deciding.
  if (authLoading) return <GlobalLoading />;

  // Already logged in, so go straight to the dashboard.
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  customConsoleLogForDev("Auth route----***");
  return <Outlet />;
};

export default AuthRoute;
