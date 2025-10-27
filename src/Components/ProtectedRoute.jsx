import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContextObject";

const ProtectedRoute = ({ children }) => {
  const { auth, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) return null;
  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/signin" replace />;
  }
  if (
    auth.role === "admin" &&
    localStorage.getItem("otp_verified") !== "true" &&
    location.pathname !== "/admin/otp"
  ) {
    return <Navigate to="/admin/otp" replace />;
  }
  if (!auth.token && location.pathname !== "/admin/otp") {
    return <Navigate to="/admin/otp" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
