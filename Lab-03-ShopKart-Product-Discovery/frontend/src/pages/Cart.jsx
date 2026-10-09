import ProductImage from "../components/ProductImage";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { errorMessage } from "../services/api";
import { money } from "../utils/format";

export default function Cart() {
  const { cart, count, subtotal, loading, error, reload, update, remove } =
    useCart();
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const change = async (id, action) => {
    setBusyId(id);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId("");
    }
  };
  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR BAG</p>
          <h1>
            Shopping cart<span>.</span>
          </h1>
          <p>
            {count} {count === 1 ? "item" : "items"} in your bag
          </p>
        </div>
        <Link className="text-link" to="/products">
          <ArrowLeft size={17} /> Continue shopping
        </Link>
      </div>
      {(error || actionError) && (
        <div className="alert" role="alert">
          {actionError || error}
          {error && <button onClick={reload}>Try again</button>}
        </div>
      )}
      {loading ? (
        <div className="empty-state">Loading your cart...</div>
      ) : !cart.length ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ShoppingBag size={36} />
          </div>
          <h2>Your bag is empty.</h2>
          <p>Find something you love and add it here.</p>
          <Link className="primary-link" to="/products">
            Explore products <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="commerce-layout">
          <div className="cart-lines">
            {cart.map(({ product, quantity }) => (
              <article className="cart-line" key={product._id}>
                <Link to={`/products/${product._id}`}>
                  <ProductImage src={product.image} alt={product.name} />
                </Link>
                <div className="cart-line-main">
                  <div>
                    <span className="eyebrow">{product.category}</span>
                    <Link to={`/products/${product._id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    <p>{money(product.price)} each</p>
                  </div>
                  <button
                    className="remove-link"
                    disabled={busyId === product._id}
                    onClick={() =>
                      change(product._id, () => remove(product._id))
                    }
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
                <div className="cart-line-end">
                  <strong>{money(product.price * quantity)}</strong>
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease ${product.name} quantity`}
                      disabled={busyId === product._id || quantity <= 1}
                      onClick={() =>
                        change(product._id, () =>
                          update(product._id, quantity - 1),
                        )
                      }
                    >
                      <Minus size={15} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      aria-label={`Increase ${product.name} quantity`}
                      disabled={
                        busyId === product._id || quantity >= product.stock
                      }
                      onClick={() =>
                        change(product._id, () =>
                          update(product._id, quantity + 1),
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <small>
                    {quantity >= product.stock
                      ? "Stock limit reached"
                      : `${product.stock} in stock`}
                  </small>
                </div>
              </article>
            ))}
          </div>
          <aside className="summary-card">
            <p className="eyebrow">ORDER SUMMARY</p>
            <h2>Your total</h2>
            <div className="summary-row">
              <span>Subtotal ({count} items)</span>
              <b>{money(subtotal)}</b>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <Link className="primary-link full" to="/checkout">
              Proceed to checkout <ArrowRight size={18} />
            </Link>
            <p className="secure-note">
              Cash on delivery or secure Razorpay test checkout
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
