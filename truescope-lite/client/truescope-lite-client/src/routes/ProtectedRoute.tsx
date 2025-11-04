import { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = { children?: ReactNode };

/**
 * Only allows authenticated users in.
 * If not authed, redirects to /login and preserves the "from" path.
 */
export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  // Minimal auth check:
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthed = !!user || !!token;

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Support both patterns
  return children ? <>{children}</> : <Outlet />;
}
