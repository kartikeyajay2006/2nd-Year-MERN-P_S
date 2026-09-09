import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * A route only a signed-in customer reaches.
 *
 * The check that matters is the server's: `/customers/me` either answers with
 * a customer or answers 401, and no amount of client-side state changes that.
 * This component only decides what to render while and after that question is
 * answered.
 *
 * The `loading` branch is not decoration. Before the first answer arrives
 * "nobody is signed in" and "nobody has been asked yet" look the same, and
 * redirecting on the second one throws a signed-in customer out to the login
 * page every time they refresh.
 */
export default function ProtectedRoute({ children }) {
  const { customer, loading } = useAuth();

  if (loading) {
    return (
      <main className="page page--centre">
        <p className="muted">Checking your session…</p>
      </main>
    );
  }

  if (!customer) return <Navigate to="/login" replace />;

  return children;
}
