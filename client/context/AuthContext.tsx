"use client";

/**
 * Authentication Context
 * Manages global authentication state
 * 
 * Provides:
 * - User state and loading
 * - Login/Register/Logout functions
 * - Automatic token validation
 * - Role-based access checks
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { api } from "@/lib/api";
import {
  getAuthUser,
  saveAuthData,
  clearAuthData,
  isTokenExpired,
  getAuthToken,
  AuthUser,
  AuthResponse
} from "@/lib/auth";

// Context type definition
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, number: string) => Promise<AuthResponse>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth state on mount
   * Checks if user is stored in localStorage
   * Validates token expiration
   */
  useEffect(() => {
    const initializeAuth = () => {
      const token = getAuthToken();
      const storedUser = getAuthUser();
      
      if (token && storedUser) {
        // Check if token has expired
        if (isTokenExpired()) {
          clearAuthData();
          setUser(null);
        } else {
          setUser(storedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.auth.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Save to localStorage
      saveAuthData(token, userData);
      setUser(userData);

      return { token, user: userData, message: "Login successful" };
    } catch (error: any) {
      const message = error.response?.data?.error || "Login failed";
      throw new Error(message);
    }
  };

  /**
   * Register function
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    number: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.auth.register({ name, email, password, number });
      const { token, user: userData } = response.data;
      
      // Save to localStorage
      saveAuthData(token, userData);
      setUser(userData);

      return { token, user: userData, message: "Registration successful" };
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration failed";
      throw new Error(message);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  /**
   * Check user role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user && !!getAuthToken(),
        login,
        register,
        logout,
        hasRole,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use Auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
