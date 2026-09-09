import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { messageFrom, registerCustomer } from "../services/api";

/**
 * Task 1 — create an account, then send them to sign in.
 *
 * Every field is a controlled component: the input's value comes from state
 * and changes only through `onChange`, so the form's state is the single
 * source of truth rather than the DOM's.
 */
const EMPTY = { fullName: "", email: "", password: "", phone: "" };

export default function Register() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      // Clear the complaint as soon as they start fixing it; leaving it there
      // while they type reads as the app not noticing.
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  /**
   * Check here as well as on the server.
   *
   * Not instead of: the server validates because it cannot trust a client, and
   * this validates so the person is told immediately rather than after a round
   * trip. The password rule matches the backend's own, deliberately.
   */
  function validate() {
    const found = {};
    if (!form.fullName.trim()) found.fullName = "Full name is required";
    if (!form.email.trim()) found.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      found.email = "Enter a valid email address";
    }
    if (!form.password) found.password = "Password is required";
    else if (form.password.length < 6) {
      found.password = "Password must be at least 6 characters";
    }
    if (!form.phone.trim()) found.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) {
      found.phone = "Enter a 10-digit phone number";
    }
    return found;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setApiError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await registerCustomer({ ...form, phone: form.phone.trim() });
      // Registering does not sign you in — the backend issues no cookie here —
      // so the next step is the login page, with a note saying why.
      navigate("/login", { state: { justRegistered: true }, replace: true });
    } catch (error) {
      setApiError(messageFrom(error, "Could not create the account"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={onSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="card__sub">Shop faster with saved details.</p>

        {apiError && <p className="alert alert--bad">{apiError}</p>}

        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            value={form.fullName}
            onChange={update("fullName")}
            placeholder="Kartikeya Yadav"
            autoComplete="name"
          />
          {errors.fullName && <small className="field__error">{errors.fullName}</small>}
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <small className="field__error">{errors.email}</small>}
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          {errors.password && <small className="field__error">{errors.password}</small>}
        </label>

        <label className="field">
          <span>Phone number</span>
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="9876543210"
            autoComplete="tel"
          />
          {errors.phone && <small className="field__error">{errors.phone}</small>}
        </label>

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create Account"}
        </button>

        <p className="card__foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
