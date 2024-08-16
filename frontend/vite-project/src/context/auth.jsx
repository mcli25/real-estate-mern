import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Create the auth provider component
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    refreshToken: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    let curAuth = localStorage.getItem("auth");
    if (curAuth) {
      setAuth(JSON.parse(curAuth));
    }
  }, []);

  // Sign in function
  const signIn = (userData) => {
    setAuth(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
  };

  // Sign out function
  const signOut = () => {
    setAuth({ user: null, token: "", refreshToken: "" });
    localStorage.removeItem("auth");
  };

  // Value to be provided by the context
  const value = {
    auth,
    signIn,
    signOut,
    isAuthenticated: auth.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
