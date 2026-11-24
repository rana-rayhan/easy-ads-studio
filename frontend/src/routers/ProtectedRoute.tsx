import { Navigate, Outlet } from "react-router";

import useAuth from "../features/auth/hooks/useAuth";
import { GlobalLoading } from "../features/components/Loading";
import ForbiddenPage from "../features/components/ForbiddenPage";

// The user needs at least ONE of the allowed roles to enter.
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { authLoading, isLoggedIn, roles } = useAuth();

  if (authLoading) return <GlobalLoading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // No allowedRoles means any logged-in user can enter.
  if (!allowedRoles) return <Outlet />;

  const hasAccess = roles.some((role) => allowedRoles.includes(role));
  return hasAccess ? <Outlet /> : <ForbiddenPage />;
};

export default ProtectedRoute;
