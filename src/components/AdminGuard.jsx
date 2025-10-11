import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminGuard({ children }) {
  const { user, booted } = useAuth();
  const loc = useLocation();
  if (!booted) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}
