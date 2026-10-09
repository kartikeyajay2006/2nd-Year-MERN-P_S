import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { errorMessage } from "../services/api";
export default function AddCartButton({ product, compact = false }) {
  const { customer } = useAuth();
  const { add, cart } = useCart();
  const { notify } = useShop();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const quantity =
    cart.find((item) => item.product?._id === product._id)?.quantity || 0;
  const unavailable = !product.stock || quantity >= product.stock;
  const handleAdd = async () => {
    if (!customer) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }
    setBusy(true);
    try {
      await add(product._id);
      notify(`${product.name} added to your bag`);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      className={`cart-button ${compact ? "compact" : ""}`}
      disabled={busy || unavailable}
      onClick={handleAdd}
    >
      {quantity ? <Check size={17} /> : <ShoppingBag size={17} />}
      {busy
        ? "Adding…"
        : unavailable
          ? quantity
            ? "Stock limit reached"
            : "Out of stock"
          : quantity
            ? `Add another · ${quantity} in bag`
            : "Add to bag"}
    </button>
  );
}
