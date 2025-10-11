import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, booted } = useAuth();
  const loc = useLocation();
  if (!booted) return null; // hoặc spinner
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}
