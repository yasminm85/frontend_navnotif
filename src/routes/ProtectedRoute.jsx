import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  // jika belum login
  if (!token) {
    return <Navigate to="/pages/login" replace />;
  }

  // jika route ini punya role khusus
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // redirect jika role tidak cocok
    return <Navigate to="/pages/login" replace />;
  }

  // jika lolos semua validasi
  return children;
};

export default ProtectedRoute;
