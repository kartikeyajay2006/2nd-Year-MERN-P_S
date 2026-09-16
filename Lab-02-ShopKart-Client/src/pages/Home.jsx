import { useAuth } from "../context/AuthContext";

/**
 * Task 3 — the page you only see when the cookie says you may.
 *
 * The guarding happens in `ProtectedRoute`, not here, so this page can simply
 * assume a customer exists. The data is whatever `/customers/me` returned:
 * read from the server, never from anything this app stored.
 */
export default function Home() {
  const { customer } = useAuth();

  return (
    <main className="page">
      <section className="hero">
        <p className="hero__eyebrow">ShopKart</p>
        <h1>Welcome, {customer.fullName}</h1>
        <p className="hero__sub">You are signed in. Here is what we have on file.</p>
        <a className="btn" href="http://localhost:5174/products">
          Browse products in Lab 03
        </a>
      </section>

      <section className="details">
        <h2>Your details</h2>
        <dl>
          <div className="row">
            <dt>Name</dt>
            <dd>{customer.fullName}</dd>
          </div>
          <div className="row">
            <dt>Email</dt>
            <dd>{customer.email}</dd>
          </div>
          <div className="row">
            <dt>Phone</dt>
            <dd>{customer.phone}</dd>
          </div>
        </dl>
        <p className="details__note">
          These came from <code>GET /customers/me</code>, which the server answered
          by reading a cookie this page cannot see.
        </p>
      </section>
    </main>
  );
}
