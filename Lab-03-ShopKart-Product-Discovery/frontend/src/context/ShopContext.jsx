import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "./AuthContext";
import { addWishlist, removeWishlist, fetchWishlist } from "../services/api";
const ShopContext = createContext(null);
export function ShopProvider({ children }) {
  const { customer } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const notify = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => {
    let active = true;
    setSavedIds(new Set());
    if (customer)
      fetchWishlist()
        .then((items) => {
          if (active) setSavedIds(new Set(items.map((item) => item._id)));
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [customer?._id]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const toggleSaved = async (id) => {
    const wasSaved = savedIds.has(id);
    try {
      if (wasSaved) await removeWishlist(id);
      else await addWishlist(id);
    } catch (err) {
      if (!(err.response?.status === 409 && !wasSaved)) throw err;
    }
    setSavedIds((old) => {
      const next = new Set(old);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    notify(wasSaved ? "Removed from your wishlist" : "Saved to your wishlist");
  };
  const removeSaved = async (id) => {
    await removeWishlist(id);
    setSavedIds((old) => {
      const next = new Set(old);
      next.delete(id);
      return next;
    });
    notify("Removed from your wishlist");
  };
  return (
    <ShopContext.Provider
      value={{ savedIds, toggleSaved, removeSaved, notify }}
    >
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className={`toast ${toast.type}`}>
            <Check size={18} />
            <span>{toast.message}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={17} />
            </button>
          </div>
        )}
      </div>
    </ShopContext.Provider>
  );
}
export const useShop = () => useContext(ShopContext);
