import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute() {
  const { admin, loading } = useAuth();

  if (loading) return null;
  if (!admin) return <Navigate to="/login" replace />;

  return <Outlet />;
}
