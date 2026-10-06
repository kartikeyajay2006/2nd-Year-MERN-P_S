import { ArrowLeft, ArrowRight, LockKeyhole, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, errorMessage, verifyPayment } from "../services/api";
import { money } from "../utils/format";

const fields = [{ key: "fullName", label: "Full name", placeholder: "Aarav Sharma" }, { key: "phone", label: "Phone number", placeholder: "9876543210" }, { key: "addressLine1", label: "Street address", placeholder: "House number and street" }, { key: "city", label: "City", placeholder: "Bengaluru" }, { key: "state", label: "State", placeholder: "Karnataka" }, { key: "pincode", label: "Pincode", placeholder: "560001" }];
function validate(form) { const errors = {}; for (const { key, label } of fields) if (!form[key]?.trim()) errors[key] = `${label} is required`; if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = "Enter a valid 10-digit mobile number"; if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "Pincode must contain 6 digits"; return errors; }
function loadRazorpay() { if (window.Razorpay) return Promise.resolve(); return new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = resolve; script.onerror = () => reject(new Error("Could not load Razorpay Checkout. Check your connection and try again.")); document.body.appendChild(script); }); }

export default function Checkout() {
  const { customer } = useAuth();
  const { cart, count, subtotal, loading, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: customer?.fullName || "", phone: customer?.phone || "", addressLine1: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); const invalid = validate(form); setErrors(invalid); if (Object.keys(invalid).length) return;
    setBusy(true); setError("");
    try {
      await loadRazorpay();
      const payment = await createPaymentOrder(form);
      const checkout = new window.Razorpay({ key: payment.key, amount: payment.amount, currency: payment.currency, name: "ShopKart", description: "Your ShopKart order", order_id: payment.razorpayOrderId, prefill: { name: form.fullName, contact: form.phone, email: customer?.email }, theme: { color: "#203c32" }, modal: { ondismiss: () => setBusy(false) }, handler: async (response) => { try { const order = await verifyPayment({ shopKartOrderId: payment.shopKartOrderId, ...response }); clear(); navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } }); } catch (err) { setError(`Payment returned, but verification failed: ${errorMessage(err)}. Please contact support with order ${payment.shopKartOrderId}.`); setBusy(false); } } });
      checkout.on("payment.failed", (response) => { setError(response?.error?.description || "Payment failed. Your cart is still saved; please try again."); setBusy(false); });
      checkout.open();
    } catch (err) { setError(errorMessage(err) === "Something went wrong. Please try again." ? err.message : errorMessage(err)); setBusy(false); }
  };
  return <main className="page-shell"><div className="page-heading"><div><p className="eyebrow">ALMOST THERE</p><h1>Checkout<span>.</span></h1><p>One last step to make it yours.</p></div><Link className="text-link" to="/cart"><ArrowLeft size={17} /> Back to cart</Link></div>{loading ? <div className="empty-state">Loading checkout...</div> : !cart.length ? <div className="empty-state"><h2>Your cart is empty.</h2><p>Add a few favorites before checking out.</p><Link className="primary-link" to="/products">Browse products <ArrowRight size={18} /></Link></div> : <form onSubmit={submit} className="commerce-layout checkout-layout" noValidate><div className="checkout-form"><div className="form-title"><MapPin size={23} /><div><span className="eyebrow">STEP 01</span><h2>Shipping details</h2></div></div><div className="shipping-grid">{fields.map(({ key, label, placeholder }) => <label className={key === "addressLine1" ? "wide" : ""} key={key}>{label}<input autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : key === "addressLine1" ? "street-address" : key === "pincode" ? "postal-code" : key === "state" ? "address-level1" : "address-level2"} inputMode={key === "phone" || key === "pincode" ? "numeric" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} aria-invalid={!!errors[key]} />{errors[key] && <small className="inline-error">{errors[key]}</small>}</label>)}</div></div><aside className="summary-card"><p className="eyebrow">YOUR ORDER</p><h2>Order summary</h2><div className="checkout-items">{cart.map(({ product, quantity }) => <div key={product._id}><img src={product.image} alt="" /><span>{product.name}<small>Qty {quantity}</small></span><b>{money(product.price * quantity)}</b></div>)}</div><div className="summary-row"><span>Subtotal ({count} items)</span><b>{money(subtotal)}</b></div><div className="summary-total"><span>Total to pay</span><strong>{money(subtotal)}</strong></div>{error && <p className="alert" role="alert">{error}</p>}<button className="primary-link full" disabled={busy} type="submit">{busy ? "Preparing secure checkout..." : "Pay with Razorpay"}<LockKeyhole size={17} /></button><p className="secure-note">Payments are processed securely in Razorpay Test Mode.</p></aside></form>}</main>;
}
