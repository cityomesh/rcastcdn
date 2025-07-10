"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api } from "../utils/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  checkAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    console.log("AuthContext: Verifying token...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${tokenToVerify}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("AuthContext: Token verification successful");
          setUser({
            id: data.user.userId,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
          });
          setToken(tokenToVerify);
        } else {
          console.log("AuthContext: Token verification failed - invalid token");
          // Token is invalid
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      } else {
        console.log("AuthContext: Token verification failed - HTTP error");
        // Token verification failed
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error(
        "AuthContext: Token verification failed with error:",
        error
      );
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    } finally {
      console.log("AuthContext: Setting loading to false");
      setLoading(false);
    }
  }, []);

  // Load token from localStorage on initial load only
  useEffect(() => {
    if (initialAuthCheck) return;

    console.log("AuthContext: Initial auth check");
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      console.log("AuthContext: Found saved token, verifying...");
      setToken(savedToken);
      // Verify token with backend
      verifyToken(savedToken);
    } else {
      console.log("AuthContext: No saved token found");
      setLoading(false);
    }
    setInitialAuthCheck(true);
  }, [verifyToken, initialAuthCheck]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post("api/auth/login", { username, password });

      if (response.success) {
        const { token: newToken, user: userData } = response;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("auth_token", newToken);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);
      const response = await api.post("api/auth/register", {
        username,
        email,
        password,
      });

      if (response.success) {
        const { token: newToken, user: userData } = response;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("auth_token", newToken);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const checkAuth = async () => {
    if (token) {
      await verifyToken(token);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
