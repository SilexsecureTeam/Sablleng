// src/components/Dashboard/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useCan } from "../utils/can";

const ProtectedRoute = ({ children, permission }) => {
  const { can } = useCan();

  if (!can(permission)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
