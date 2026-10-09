import {
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
export default function Navbar() {
  const { customer, signOut } = useAuth();
  const { count } = useCart();
  const { notify } = useShop();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || "light",
  );
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const logout = async () => {
    setBusy(true);
    try {
      await signOut();
      navigate("/home");
      notify("You have been signed out");
    } catch {
      notify("Could not sign out. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content =
      next === "dark" ? "#171b16" : "#f8f9f5";
    try {
      localStorage.setItem("shopkart-theme", next);
    } catch {}
    setTheme(next);
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="announcement">
        <span>GOOD FINDS. EVERYDAY JOY.</span>
        <Link to="/products">
          Meet the collection <ArrowUpRight size={13} />
        </Link>
        <span className="announcement-right">
          Complimentary shipping on every order
        </span>
      </div>
      <header className="site-header">
        <div className="nav-shell">
          <Link className="brand" to="/home" aria-label="ShopKart home">
            <span className="brand-mark">s</span>shopkart
            <span className="brand-period">.</span>
          </Link>
          <nav
            id="main-navigation"
            className={`nav-links ${open ? "open" : ""}`}
            aria-label="Main navigation"
          >
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/products">The collection</NavLink>
            <NavLink to="/wishlist">Saved finds</NavLink>
            {customer && <NavLink to="/orders">My orders</NavLink>}
          </nav>
          <div className="nav-actions">
            <Link
              className="nav-icon desktop-only"
              to="/products"
              aria-label="Search collection"
            >
              <Search size={20} />
            </Link>
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link
              className="nav-cart"
              to="/cart"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={18} />
              <span>Bag</span>
              <b>{count}</b>
            </Link>
            {customer ? (
              <div className="user-menu">
                <span>{customer.fullName.split(" ")[0]}</span>
                <button disabled={busy} onClick={logout}>
                  {busy ? "Signing out…" : "Sign out"}
                </button>
              </div>
            ) : (
              <Link className="sign-in-link" to="/login">
                Sign in <ArrowUpRight size={15} />
              </Link>
            )}
            <button
              className="mobile-menu"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="main-navigation"
            >
              {open ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
