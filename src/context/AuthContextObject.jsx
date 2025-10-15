// src/context/AuthContextObject.jsx
import { createContext } from "react";

export const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    token: null,
    user: null,
    role: null,
  },
  login: () => {},
  logout: () => {},
});
