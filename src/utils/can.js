// src/utils/can.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContextObject";
import PERMISSIONS from "../constants/permissions";

export const useCan = () => {
  const { auth } = useContext(AuthContext);

  const can = (permission) => {
    if (!auth.isAuthenticated || !auth.user?.role) return false;

    if (auth.user.role === "admin") return true;

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;

    return allowedRoles.includes(auth.user.role);
  };

  return { can };
};