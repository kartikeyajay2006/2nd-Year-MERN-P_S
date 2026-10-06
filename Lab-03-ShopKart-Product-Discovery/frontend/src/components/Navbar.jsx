import { Heart, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { customer, signOut } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === "light" ? "light" : "dark");
  const navigate = useNavigate();
  const logout = async () => { await signOut(); setOpen(false); navigate("/login"); };
  const close = () => setOpen(false);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === "dark" ? "#0b0e0f" : "#f9f8f4";
    try { localStorage.setItem("shopkart-theme", next); } catch { /* The theme still works for this visit. */ }
    setTheme(next);
  };
  const themeButton = <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Light theme" : "Dark theme"}>{theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}</button>;
  return <>
    <div className="announcement">Curated finds for every corner of your life <span>✦</span> Discover something new today</div>
    <header className="site-header"><div className="nav-shell">
      <Link className="brand" to={customer ? "/home" : "/login"} onClick={close}><span className="brand-mark">S</span>shop<span>kart</span><i>.</i></Link>
      {customer ? <>
        <nav className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation"><NavLink to="/home" onClick={close}>Home</NavLink><NavLink to="/products" onClick={close}>Shop</NavLink><NavLink to="/wishlist" onClick={close}>Wishlist</NavLink><NavLink to="/orders" onClick={close}>My orders</NavLink></nav>
        <div className="nav-actions"><Link className="nav-icon desktop-only" to="/products" aria-label="Browse products"><Search size={20} /></Link><Link className="nav-icon desktop-only" to="/wishlist" aria-label="Wishlist"><Heart size={20} /></Link>{themeButton}<Link className="nav-cart" to="/cart"><ShoppingBag size={19} /><span>Cart</span><b>{count}</b></Link><div className="user-menu"><UserRound size={17} /><span>{customer.fullName.split(" ")[0]}</span><button type="button" onClick={logout}>Sign out</button></div><button className="mobile-menu" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
      </> : <nav className="guest-nav">{themeButton}<Link to="/login">Sign in</Link><Link className="nav-cart" to="/register">Create account <span>→</span></Link></nav>}
    </div></header>
  </>;
}
