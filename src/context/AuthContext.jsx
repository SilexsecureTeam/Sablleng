// src/context/AuthContext.jsx
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextObject";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    role: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔐 AuthProvider: Initializing...");

    try {
      const token = sessionStorage.getItem("authToken");
      const storedUser = sessionStorage.getItem("user");
      const role = sessionStorage.getItem("role");
      // const otpVerified = sessionStorage.getItem("otp_verified");

      console.log("📦 AuthProvider: Found in localStorage:", {
        hasToken: !!token,
        hasUser: !!storedUser,
        role: role || "none",
        // otpVerified: !!otpVerified,
      });

      if (storedUser && role) {
        const user = JSON.parse(storedUser);
        setAuth({
          isAuthenticated: true,
          token: token || null,
          user,
        });

        console.log("✅ AuthProvider: Auth restored successfully", {
          tokenPreview: token ? token.substring(0, 20) + "..." : "none",
          userName: user.name || user.email,
          role,
        });
      } else {
        console.log("⚠️ AuthProvider: No valid auth data found");
      }
    } catch (error) {
      console.error("❌ AuthProvider: Error restoring auth:", error);
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");
      // sessionStorage.removeItem("otp_verified");
    } finally {
      setIsLoading(false);
      console.log("🎯 AuthProvider: Initialization complete");
    }
  }, []);

  const login = (token, user, role) => {
    try {
      if (token) sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("role", role || user.role || "user");

      setAuth({
        isAuthenticated: true,
        token,
        user,
        role: role || user.role || "user",
      });

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    console.log("👋 AuthProvider: Logout called");

    try {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");
      // sessionStorage.removeItem("otp_verified");
      // sessionStorage.removeItem("cart_session_id");
      // sessionStorage.removeItem("cart_items");
      // sessionStorage.removeItem("cart_total");
      setAuth({
        isAuthenticated: false,
        token: null,
        user: null,
        role: null,
      });

      console.log("✅ AuthProvider: Logout successful");
      return true;
    } catch (error) {
      console.error("❌ AuthProvider: Logout failed:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8">
              <svg
                className="w-16 h-16 text-[#5F1327] animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Your Experience
          </h2>
          <p className="text-gray-600 animate-pulse">
            Preparing everything for you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
