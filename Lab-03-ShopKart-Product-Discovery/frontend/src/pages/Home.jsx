import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Home() { const { customer } = useAuth(); return <main className="home"><p>SHOPKART</p><h1>Welcome, {customer.fullName}</h1><p>Your account is ready. Browse products from our live catalogue.</p><Link className="button home-button" to="/products">Browse Products</Link></main>; }
