import { ArrowRight, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage, fetchOrders } from "../services/api";
import { date, money } from "../utils/format";

export default function Orders() {
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setOrders(await fetchOrders()); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  return <main className="page-shell"><div className="page-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h1>My orders<span>.</span></h1><p>Every order, from first click to doorstep.</p></div><Link className="text-link" to="/products">Keep exploring <ArrowRight size={17} /></Link></div>{loading ? <div className="empty-state">Loading your orders...</div> : error ? <div className="empty-state"><h2>We couldn't load your orders.</h2><p>{error}</p><button onClick={load}>Try again</button></div> : !orders.length ? <div className="empty-state"><div className="empty-icon"><Package size={36} /></div><h2>No orders yet.</h2><p>Your future favorites are waiting in the shop.</p><Link className="primary-link" to="/products">Start shopping <ArrowRight size={18} /></Link></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-card-top"><div><span className="eyebrow">ORDER #{order._id.slice(-8).toUpperCase()}</span><h2>{date(order.createdAt)}</h2></div><span className={`status-pill ${order.paymentStatus === "PAID" ? "paid" : "pending"}`}>{order.status.replaceAll("_", " ")}</span></div><div className="order-preview">{order.items.slice(0, 3).map((item, index) => <img key={index} src={item.image} alt={item.name} />)}<span>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(" · ")}</span></div><div className="order-card-bottom"><strong>{money(order.totalAmount)}</strong><Link to={`/orders/${order._id}`}>View order <ArrowRight size={17} /></Link></div></article>)}</div>}</main>;
}
