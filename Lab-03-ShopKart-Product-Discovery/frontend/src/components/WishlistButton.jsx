import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { errorMessage } from "../services/api";
export default function WishlistButton({ id, compact = false }) {
  const { customer } = useAuth();
  const { savedIds, toggleSaved, notify } = useShop();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const saved = savedIds.has(id);
  const toggle = async () => {
    if (!customer) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }
    setBusy(true);
    try {
      await toggleSaved(id);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      className={`wish-button ${saved ? "is-saved" : ""} ${compact ? "icon-button" : ""}`}
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {!compact && (
        <span>
          {busy
            ? "Updating…"
            : saved
              ? "Saved to wishlist"
              : "Save to wishlist"}
        </span>
      )}
    </button>
  );
}
