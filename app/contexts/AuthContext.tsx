"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { User, AuthContextType, LoginResponse } from "../types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const initialCheckComplete = useRef(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for stored token on app start
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth-token");

        if (storedToken) {
          // Verify token with server
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/api/auth/verify-token`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setToken(storedToken);
              setUser({
                ...data.user,
                createdAt: "",
                isActive: true,
              });
            } else {
              // Token is invalid, remove it
              localStorage.removeItem("auth-token");
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("auth-token");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
        }
      } finally {
        initialCheckComplete.current = true;
        setLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser({
          ...data.user,
          createdAt: "",
          isActive: true,
        });
        localStorage.setItem("auth-token", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth-token");
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    loading,
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

export type { User };
