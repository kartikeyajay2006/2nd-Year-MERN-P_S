import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import StoreFooter from "./components/StoreFooter";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const name = pathname.split("/")[1] || "Home";
    document.title = `${name.charAt(0).toUpperCase() + name.slice(1)} — ShopKart`;
  }, [pathname]);
  return (
    <>
      <Navbar />
      <div
        id="main-content"
        tabIndex={-1}
        key={pathname}
        className="route-content"
      >
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          {[
            ["wishlist", <Wishlist />],
            ["cart", <Cart />],
            ["checkout", <Checkout />],
            ["orders", <Orders />],
            ["orders/:id", <OrderDetails />],
          ].map(([path, element]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
      <StoreFooter />
    </>
  );
}
