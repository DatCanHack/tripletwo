import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // ghi nhớ trang người dùng muốn vào, để login xong quay lại
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
