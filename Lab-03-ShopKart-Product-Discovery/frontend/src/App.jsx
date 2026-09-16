import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
export default function App() { return <><Navbar /><Routes><Route path="/" element={<Navigate to="/home" replace />} /><Route path="/register" element={<Register />} /><Route path="/login" element={<Login />} /><Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} /><Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} /><Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes></>; }
