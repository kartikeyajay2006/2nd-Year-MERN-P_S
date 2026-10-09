import ProductImage from "../components/ProductImage";
import { ArrowLeft, CheckCircle2, MapPin, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { errorMessage, fetchOrder } from "../services/api";
import { date, money } from "../utils/format";

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setOrder(null);
    setError("");
    fetchOrder(id)
      .then((item) => {
        if (active) setOrder(item);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <main className="page-shell">
      <Link className="back-link" to="/orders">
        <ArrowLeft size={17} /> All orders
      </Link>
      {error ? (
        <div className="empty-state">
          <h2>We couldn't load this order.</h2>
          <p>{error}</p>
        </div>
      ) : !order ? (
        <div className="empty-state">Loading order...</div>
      ) : (
        <>
          <div className="confirmation-banner">
            <div className="confirmation-icon">
              {order.paymentStatus === "PAID" ? (
                <CheckCircle2 size={29} />
              ) : (
                <PackageCheck size={29} />
              )}
            </div>
            <div>
              <p className="eyebrow">
                {location.state?.justPlaced
                  ? "ORDER CONFIRMED"
                  : "ORDER DETAILS"}
              </p>
              <h1>
                {order.status !== "PENDING_PAYMENT"
                  ? "Thank you for your order."
                  : "Your order is pending payment."}
              </h1>
              <p>
                Order #{order._id.slice(-8).toUpperCase()} ·{" "}
                {date(order.createdAt)}
              </p>
            </div>
            <span
              className={`status-pill ${order.paymentStatus === "PAID" ? "paid" : "pending"}`}
            >
              {order.status.replaceAll("_", " ")}
            </span>
          </div>
          <div className="order-timeline" aria-label="Order progress">
            {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].map(
              (step, index, steps) => (
                <span
                  key={step}
                  className={
                    steps.indexOf(order.status) >= index ? "complete" : ""
                  }
                >
                  <b>
                    {steps.indexOf(order.status) >= index ? "✓" : index + 1}
                  </b>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              ),
            )}
          </div>
          <div className="commerce-layout">
            <div className="order-details-panel">
              <h2>Items in your order</h2>
              {order.items.map((item, index) => (
                <div className="order-item" key={index}>
                  <ProductImage src={item.image} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {money(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <b>{money(item.price * item.quantity)}</b>
                </div>
              ))}
              <div className="order-total">
                <span>
                  {order.paymentMethod === "COD"
                    ? "Due on delivery"
                    : order.paymentStatus === "PAID"
                      ? "Total paid"
                      : "Total payable"}
                </span>
                <strong>{money(order.totalAmount)}</strong>
              </div>
            </div>
            <aside className="summary-card">
              <MapPin size={25} />
              <h2>Delivery address</h2>
              <p className="eyebrow">
                {order.paymentMethod === "COD"
                  ? "CASH ON DELIVERY"
                  : "RAZORPAY TEST PAYMENT"}
              </p>
              <p>
                <b>{order.shippingAddress.fullName}</b>
                <br />
                {order.shippingAddress.addressLine1}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
                <br />
                {order.shippingAddress.phone}
              </p>
              <Link className="outline-link" to="/products">
                Continue shopping
              </Link>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
