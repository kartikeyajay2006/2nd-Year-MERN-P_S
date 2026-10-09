import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
  const { customer, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <main className="page-shell">
        <div className="empty-state">
          <span className="loading-ring" />
          <p>Getting your ShopKart ready…</p>
        </div>
      </main>
    );
  return customer ? (
    children
  ) : (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
}
