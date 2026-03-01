"use client";

/**
 * Protected Route Component
 * 
 * Wraps pages that require authentication and/or specific roles
 * 
 * Usage:
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * Security:
 * - Server-side validation must still be enforced
 * - This is frontend UX optimization only
 * - Backend ALWAYS enforces authorization
 */

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole = "user",
  fallback = null
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to load
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback or nothing if not authenticated/authorized
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return fallback;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Hook for role-based rendering
 * Usage: {canAccess("admin") && <AdminPanel />}
 */
export function useCanAccess(requiredRole?: string) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return false;
  if (!requiredRole) return true;

  return user?.role === requiredRole;
}
