import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = { children?: ReactNode };

/**
 * Only for guests. If already authed, redirect to /dashboard.
 */
export default function GuestRoute({ children }: Props) {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthed = !!user || !!token;

  if (isAuthed) return <Navigate to="/dashboard" replace />;

  return children ? <>{children}</> : <Outlet />;
}
