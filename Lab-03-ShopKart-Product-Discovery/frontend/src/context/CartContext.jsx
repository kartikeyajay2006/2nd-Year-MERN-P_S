import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addCart, errorMessage, fetchCart, removeCart, updateCart } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { customer, loading: authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setCart(await fetchCart()); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    if (authLoading) return;
    if (!customer) { setCart([]); setError(""); setLoading(false); return; }
    reload();
  }, [customer?._id, authLoading, reload]);
  const add = async (id) => { const next = await addCart(id); setCart(next); return next; };
  const update = async (id, quantity) => { const next = await updateCart(id, quantity); setCart(next); return next; };
  const remove = async (id) => { const next = await removeCart(id); setCart(next); return next; };
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  return <CartContext.Provider value={{ cart, count, subtotal, loading, error, reload, add, update, remove, clear: () => setCart([]) }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
