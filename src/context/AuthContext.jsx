import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    role: null,
  });

  // Check for existing token and role in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    console.log("AuthContext on mount:", { token, user: storedUser, role }); // Log on mount
    if (token && storedUser) {
      setAuth({
        isAuthenticated: true,
        token,
        user: JSON.parse(storedUser || "{}"),
        role,
      });
    }
  }, []);

  const login = (token, user, role) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);
    setAuth({ isAuthenticated: true, token, user, role });
    // console.log("AuthContext after login:", { token, user, role });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setAuth({ isAuthenticated: false, token: null, user: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
