import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginCustomer, messageFrom } from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * Task 2 — sign in, and let the browser keep the cookie.
 *
 * Nothing is stored by this page. The response sets an HttpOnly cookie that
 * JavaScript cannot read, and that cookie is the session from here on. What
 * this page does afterwards is ask the server who is now signed in, which is
 * what `refresh()` does.
 */
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  // Set by the register page so the trip between them explains itself.
  const justRegistered = location.state?.justRegistered;

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setError("");
    };
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await loginCustomer(form);
      // The cookie exists now. Ask the server who that is before routing, so
      // /home arrives with its data instead of fetching on the way in.
      await refresh();
      navigate("/home", { replace: true });
    } catch (err) {
      // The backend answers 401 with "Invalid credentials" for both an unknown
      // email and a wrong password - deliberately, since saying which one was
      // wrong tells an attacker which emails are registered.
      setError(messageFrom(err, "Invalid Credentials"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={onSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="card__sub">Log in to continue shopping.</p>

        {justRegistered && (
          <p className="alert alert--good">Account created. Log in to continue.</p>
        )}
        {error && <p className="alert alert--bad">{error}</p>}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </label>

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Logging in…" : "Login"}
        </button>

        <p className="card__foot">
          New to ShopKart? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
