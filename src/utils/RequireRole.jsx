import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RequireRole({ allowedRoles, children }) {
  const { user } = useSelector((state) => state.auth);

  // Belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role tidak cocok
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
