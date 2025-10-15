// src/context/AuthContext.jsx
import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
import { AuthContext } from "./AuthContextObject";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    role: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    console.log("AuthContext: Loaded from localStorage:", {
      token,
      user: storedUser,
      role,
    });

    if (token && storedUser) {
      setAuth({
        isAuthenticated: true,
        token,
        user: JSON.parse(storedUser || "{}"),
        role,
      });
      console.log("AuthContext: Restored auth state:", {
        isAuthenticated: true,
        token: token.substring(0, 20) + "...",
      });
    }
  }, []);

  const login = (token, user, role) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);
    setAuth({ isAuthenticated: true, token, user, role });
    console.log("AuthContext: Login:", {
      token: token.substring(0, 20) + "...",
      user,
      role,
    });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setAuth({ isAuthenticated: false, token: null, user: null, role: null });
    console.log("AuthContext: Logged out");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
