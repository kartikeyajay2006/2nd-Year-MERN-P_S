import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, logoutCustomer } from "../services/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null); const [loading, setLoading] = useState(true);
  const refresh = async () => { try { setCustomer(await fetchMe()); } catch { setCustomer(null); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);
  const signOut = async () => { try { await logoutCustomer(); } finally { setCustomer(null); } };
  return <AuthContext.Provider value={{ customer, loading, refresh, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
