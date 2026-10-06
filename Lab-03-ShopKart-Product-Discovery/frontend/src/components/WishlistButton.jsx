import { useState } from "react";
import { Heart } from "lucide-react";
import { addWishlist, errorMessage } from "../services/api";

export default function WishlistButton({ id, saved, onSaved, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (busy || saved) return;
    setBusy(true); setError("");
    try { await addWishlist(id); onSaved?.(id); }
    catch (err) { if (err?.response?.status === 409) onSaved?.(id); else setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  return <><button type="button" className={`wish-button ${saved ? "is-saved" : ""} ${compact ? "icon-button" : ""}`} onClick={save} disabled={saved || busy} aria-label={saved ? "Saved to wishlist" : "Add to wishlist"} title={error || undefined}><Heart size={18} fill={saved ? "currentColor" : "none"} />{!compact && <span>{busy ? "Saving..." : saved ? "Saved to wishlist" : "Save to wishlist"}</span>}</button>{error && <p className="inline-error" role="alert">{error}</p>}</>;
}
