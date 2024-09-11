import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import * as jwtDecode from "jwt-decode";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    refreshToken: "",
  });

  const navigate = useNavigate();

  const setAuthHeader = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  useEffect(() => {
    const curAuth = localStorage.getItem("auth");
    if (curAuth) {
      const parsedAuth = JSON.parse(curAuth);
      if (isTokenValid(parsedAuth.token)) {
        setAuth(parsedAuth);
        setAuthHeader(parsedAuth.token);
      } else {
        // Token is invalid, attempt to refresh
        refreshToken(parsedAuth.refreshToken);
      }
    }
  }, [setAuthHeader]);

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode.default(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  };

  const refreshToken = useCallback(
    async (refreshToken) => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/refresh-token`,
          { refreshToken }
        );
        const { token, refreshToken: newRefreshToken, user } = response.data;
        const updatedAuth = { user, token, refreshToken: newRefreshToken };
        setAuth(updatedAuth);
        localStorage.setItem("auth", JSON.stringify(updatedAuth));
        setAuthHeader(token);
        return token;
      } catch (error) {
        console.error("Error refreshing token:", error);
        signOut();
        navigate("/login");
        throw error;
      }
    },
    [navigate, setAuthHeader]
  );

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshToken(auth.refreshToken);
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            signOut();
            navigate("/login");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [auth.refreshToken, navigate, refreshToken]);

  const signIn = useCallback(
    (userData) => {
      setAuth(userData);
      localStorage.setItem("auth", JSON.stringify(userData));
      setAuthHeader(userData.token);
    },
    [setAuthHeader]
  );

  const signOut = useCallback(() => {
    setAuth({ user: null, token: "", refreshToken: "" });
    localStorage.removeItem("auth");
    setAuthHeader(null);
  }, [setAuthHeader]);

  const value = {
    auth,
    setAuth,
    signIn,
    signOut,
    isAuthenticated: auth.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
