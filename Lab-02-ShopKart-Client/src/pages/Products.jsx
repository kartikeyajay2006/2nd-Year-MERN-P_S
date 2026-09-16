import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { fetchProducts, messageFrom } from "../services/api";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        setProducts(await fetchProducts({ search, category }));
      } catch (requestError) {
        setProducts([]);
        setError(messageFrom(requestError, "Something went wrong while loading products."));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(request);
  }, [search, category]);

  return (
    <main className="page page--catalogue">
      <section className="catalogue-heading">
        <div><p className="hero__eyebrow">ShopKart catalogue</p><h1>Find something you love</h1></div>
        <p>Browse the latest products, then narrow the list by name or category.</p>
      </section>
      <SearchBar search={search} category={category} onSearchChange={setSearch} onCategoryChange={setCategory} />
      {loading && <p className="state-message" role="status">Loading products...</p>}
      {!loading && error && <p className="state-message state-message--error" role="alert">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="state-message">No products found.</p>}
      {!loading && !error && products.length > 0 && <section className="product-grid" aria-label="Products">{products.map((product) => <ProductCard key={product._id} product={product} />)}</section>}
    </main>
  );
}
