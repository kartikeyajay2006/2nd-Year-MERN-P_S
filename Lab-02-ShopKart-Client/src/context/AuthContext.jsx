import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, logoutCustomer } from "../services/api";

/**
 * Who is signed in, asked of the server rather than remembered here.
 *
 * The obvious shortcut is to keep the customer returned by the login call in
 * state, or in localStorage, and treat that as the answer. It is the wrong
 * answer for two reasons. It is a copy that goes stale the moment the session
 * expires or the cookie is cleared in another tab; and it is a claim the
 * client makes about itself, which is not something a client gets to decide.
 * The cookie is the session, only the server can read it, so the server is
 * asked.
 *
 * This is React state, not Redux — the lab forbids Redux and a single piece of
 * shared state does not need it.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  // Starts true: until the first `/customers/me` answers, "not signed in" and
  // "not asked yet" look identical, and treating them the same is what makes a
  // protected page flash the login screen on every refresh.
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setCustomer(await fetchMe());
    } catch {
      // A 401 here is the normal answer for a visitor, not an error.
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await logoutCustomer();
    } finally {
      // Forget them locally whatever the server said. If the call failed
      // because the session was already gone, staying "signed in" would be
      // the wrong outcome.
      setCustomer(null);
    }
  }, []);

  const value = useMemo(
    () => ({ customer, loading, refresh, signOut }),
    [customer, loading, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
