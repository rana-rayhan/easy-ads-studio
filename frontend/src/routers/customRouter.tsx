import { createBrowserRouter, Navigate } from "react-router";

import AuthRoute from "./AuthRoute";
import ErrorPage from "../pages/ErrorPage";
import Login from "../features/auth/components/Login";
import Register from "../features/auth/components/Register";
import UserList from "../features/admin/components/UserList";
import Dashboard from "../features/dashboard/components/Dashboard";
import Navbar from "../layouts/Navbar";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    errorElement: <ErrorPage />,
    children: [
      // "/" has no page of its own, so go to the dashboard.
      { index: true, element: <Navigate to="/dashboard" replace /> },
      // Only for people who are NOT logged in.
      {
        element: <AuthRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },
      // No route guard. The backend checks the session, and the dashboard shows a login link when logged out.
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <UserList pageSize={10} /> },
      { path: "user/list", element: <UserList pageSize={10} /> }, // Example multiple path

      // Any unknown URL goes back to "/".
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
