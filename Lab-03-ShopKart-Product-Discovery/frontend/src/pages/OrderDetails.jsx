import { ArrowLeft, CheckCircle2, MapPin, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { errorMessage, fetchOrder } from "../services/api";
import { date, money } from "../utils/format";

export default function OrderDetails() {
  const { id } = useParams(); const location = useLocation();
  const [order, setOrder] = useState(null); const [error, setError] = useState("");
  useEffect(() => { fetchOrder(id).then(setOrder).catch((err) => setError(errorMessage(err))); }, [id]);
  return <main className="page-shell"><Link className="back-link" to="/orders"><ArrowLeft size={17} /> All orders</Link>{error ? <div className="empty-state"><h2>We couldn't load this order.</h2><p>{error}</p></div> : !order ? <div className="empty-state">Loading order...</div> : <><div className="confirmation-banner"><div className="confirmation-icon">{order.paymentStatus === "PAID" ? <CheckCircle2 size={29} /> : <PackageCheck size={29} />}</div><div><p className="eyebrow">{location.state?.justPlaced ? "ORDER CONFIRMED" : "ORDER DETAILS"}</p><h1>{order.paymentStatus === "PAID" ? "Thank you for your order." : "Your order is pending payment."}</h1><p>Order #{order._id.slice(-8).toUpperCase()} · {date(order.createdAt)}</p></div><span className={`status-pill ${order.paymentStatus === "PAID" ? "paid" : "pending"}`}>{order.status.replaceAll("_", " ")}</span></div><div className="commerce-layout"><div className="order-details-panel"><h2>Items in your order</h2>{order.items.map((item, index) => <div className="order-item" key={index}><img src={item.image} alt={item.name} /><div><h3>{item.name}</h3><p>{money(item.price)} × {item.quantity}</p></div><b>{money(item.price * item.quantity)}</b></div>)}<div className="order-total"><span>Total paid</span><strong>{money(order.totalAmount)}</strong></div></div><aside className="summary-card"><MapPin size={25} /><h2>Delivery address</h2><p><b>{order.shippingAddress.fullName}</b><br />{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />{order.shippingAddress.phone}</p><Link className="outline-link" to="/products">Continue shopping</Link></aside></div></>}</main>;
}
