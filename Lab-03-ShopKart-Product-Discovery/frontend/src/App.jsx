import { Navigate, Route, Routes } from "react-router-dom";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
export default function App() { return <Routes><Route path="/" element={<Navigate to="/products" replace />} /><Route path="/products" element={<Products />} /><Route path="/products/:id" element={<ProductDetails />} /><Route path="*" element={<Navigate to="/products" replace />} /></Routes>; }
