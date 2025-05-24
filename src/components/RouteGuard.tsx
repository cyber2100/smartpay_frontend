import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true for protected routes, false for public routes
  redirectTo?: string; // custom redirect path
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo 
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // For protected routes (requireAuth = true)
  if (requireAuth && !isAuthenticated) {
    // Redirect to signin and preserve the attempted URL
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // For public routes that authenticated users shouldn't access (requireAuth = false)
  if (!requireAuth && isAuthenticated) {
    // Check if there's a "from" location in state (where user was trying to go)
    const from = location.state?.from?.pathname;
    const redirectPath = redirectTo || from || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Specific wrapper for authentication pages (signin, signup)
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={false} redirectTo="/dashboard">
      {children}
    </RouteGuard>
  );
};

// Specific wrapper for protected pages
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  );
};