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
   */
  useEffect(() => {
    const storedUser = getAuthUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
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
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register function
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    number: string,
    role: string,
    inTeam: boolean
  ): Promise<AuthResponse> => {
    try {
      const response = await api.auth.register({ name, email, password, number, role, inTeam });
      const { token, user: userData } = response.data;
      
      // Save to localStorage
      saveAuthData(token, userData);
      setUser(userData);
      
      return response.data;
    } catch (error) {
      throw error;
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
   * Check if user has specific role
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

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
