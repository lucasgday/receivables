
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const isDevelopment = import.meta.env.DEV;

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (isDevelopment) {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
