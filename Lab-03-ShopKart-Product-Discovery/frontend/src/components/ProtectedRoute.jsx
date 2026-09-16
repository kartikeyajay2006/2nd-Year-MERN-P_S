import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) { const { customer, loading } = useAuth(); if (loading) return <main><p className="state">Checking your session...</p></main>; return customer ? children : <Navigate to="/login" replace />; }
