import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

/**
 * The three routes the lab asks for, plus the two that stop a wrong URL
 * looking like a broken app.
 */
export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        {/* Landing on the root should not be a blank page. */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={<ProtectedRoute><Products /></ProtectedRoute>}
        />
        <Route
          path="/products/:id"
          element={<ProtectedRoute><ProductDetails /></ProtectedRoute>}
        />
        {/* Anything else goes somewhere real rather than nowhere. */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
