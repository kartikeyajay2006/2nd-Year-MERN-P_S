import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { errorMessage } from "../services/api";

export default function AddCartButton({ product, compact = false }) {
  const { add, cart } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const quantity = cart.find((item) => item.product?._id === product._id)?.quantity || 0;
  const unavailable = !product.stock || quantity >= product.stock;
  const handleAdd = async () => {
    setBusy(true); setError("");
    try { await add(product._id); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <><button type="button" className={`cart-button ${compact ? "compact" : ""}`} disabled={busy || unavailable} onClick={handleAdd}><ShoppingBag size={18} />{busy ? "Adding..." : unavailable ? quantity ? "Stock limit reached" : "Out of stock" : quantity ? `Add another · ${quantity} in cart` : "Add to cart"}</button>{error && <p className="inline-error" role="alert">{error}</p>}</>;
}
