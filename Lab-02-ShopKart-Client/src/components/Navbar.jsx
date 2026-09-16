import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Task 4 — the bar, and the logout that ends the session.
 *
 * Logging out is a request, not a local change. The cookie is HttpOnly, so
 * this app cannot delete it; only the server can, by answering with one that
 * has already expired. Clearing state here without that call would leave the
 * session alive and the next reload would sign them straight back in.
 */
export default function Navbar() {
  const { customer, signOut } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="nav">
      <Link className="nav__brand" to={customer ? "/home" : "/login"}>
        Shop<span>Kart</span>
      </Link>

      <nav className="nav__links">
        {customer ? (
          <>
            <Link className="nav__link" to="/products">Products</Link>
            <span className="nav__who">{customer.fullName}</span>
            <button className="btn btn--ghost" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="nav__link" to="/login">
              Login
            </Link>
            <Link className="btn btn--small" to="/register">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
