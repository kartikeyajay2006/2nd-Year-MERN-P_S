import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage, loginCustomer, registerCustomer } from "../services/api";
export default function AuthForm({ register = false }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { customer, refresh } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination =
    location.state?.from?.startsWith("/") &&
    !location.state.from.startsWith("//") &&
    !location.state.from.includes("\\")
      ? location.state.from
      : "/home";
  if (customer) return <Navigate to={destination} replace />;
  const update = (event) =>
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (register) {
        await registerCustomer(form);
        navigate("/login", {
          state: { registered: true, from: destination },
          replace: true,
        });
      } else {
        await loginCustomer(form);
        await refresh();
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth">
      <section className="auth-visual">
        <img
          src="/images/hero-living-room.jpg"
          alt="A warm and welcoming home"
        />
        <div>
          <p className="eyebrow">YOUR EVERYDAY, A LITTLE BETTER.</p>
          <h2>
            Good things.
            <br />
            <em>Great company.</em>
          </h2>
          <p>
            Your next favorite is waiting.
            <br />
            Make yourself at home.
          </p>
        </div>
        <span>THE SHOPKART EDIT / 2026</span>
      </section>
      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="auth-mark">s.</span>
          <p className="eyebrow">
            {register ? "A LITTLE SOMETHING FOR YOU" : "YOUR OWN LITTLE CORNER"}
          </p>
          <h1>{register ? "Come on in." : "Welcome back."}</h1>
          <p>
            {register
              ? "Create an account. Discover your kind of good."
              : "Sign in and pick up where you left off."}
          </p>
          {location.state?.registered && !register && (
            <p className="success-alert" role="status">
              Your account is ready. Sign in to start exploring.
            </p>
          )}
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          {register && (
            <label>
              Full name
              <input
                name="fullName"
                autoComplete="name"
                placeholder="Your full name"
                minLength={2}
                maxLength={100}
                value={form.fullName}
                onChange={update}
                required
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update}
              maxLength={254}
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={
                  register ? "At least 8 characters" : "Your password"
                }
                minLength={register ? 8 : undefined}
                maxLength={72}
                value={form.password}
                onChange={update}
                required
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {register && (
            <label>
              Mobile number
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit Indian mobile number"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                title="Enter a 10-digit Indian mobile number"
                value={form.phone}
                onChange={update}
                required
              />
            </label>
          )}
          <button className="primary-link full" type="submit" disabled={busy}>
            {busy
              ? register
                ? "Creating your account…"
                : "Signing you in…"
              : register
                ? "Create account"
                : "Sign in"}
            <ArrowRight size={18} />
          </button>
          <p className="auth-switch">
            {register ? "Already part of the family?" : "New around here?"}{" "}
            <Link
              to={register ? "/login" : "/register"}
              state={{ from: destination }}
            >
              {register ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <div className="auth-security">
            <ShieldCheck size={17} /> Your session is protected with a secure
            cookie.
          </div>
        </form>
      </section>
    </main>
  );
}
