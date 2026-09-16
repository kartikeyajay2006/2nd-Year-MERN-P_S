import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProduct, messageFrom } from "../services/api";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true); setError("");
      try { setProduct(await fetchProduct(id)); }
      catch (requestError) { setError(messageFrom(requestError, "Something went wrong while loading this product.")); }
      finally { setLoading(false); }
    }
    loadProduct();
  }, [id]);

  if (loading) return <main className="page page--centre"><p className="state-message" role="status">Loading product...</p></main>;
  if (error) return <main className="page page--centre"><div><p className="state-message state-message--error" role="alert">{error}</p><Link className="btn btn--ghost" to="/products">Back to products</Link></div></main>;

  return (
    <main className="page product-detail">
      <Link className="back-link" to="/products">← Back to products</Link>
      <article className="product-detail__card">
        <img src={product.image} alt={product.name} />
        <div className="product-detail__content">
          <p className="product-card__category">{product.category}</p><h1>{product.name}</h1>
          <p className="product-detail__price">{money.format(product.price)}</p><p className="muted">{product.description}</p>
          <dl><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Availability</dt><dd>{product.stock === 0 ? "Out of stock" : `${product.stock} units in stock`}</dd></div></dl>
          <button className="btn" type="button" disabled={product.stock === 0}>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</button>
          <p className="product-detail__note">Cart functionality will be added in the next lab.</p>
        </div>
      </article>
    </main>
  );
}
