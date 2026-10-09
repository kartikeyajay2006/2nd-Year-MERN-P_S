import { Search, ArrowDownUp, X, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { errorMessage, fetchProducts } from "../services/api";
const categories = ["All", "Electronics", "Fashion", "Books", "Home"];
export default function Products() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = categories.includes(params.get("category"))
    ? params.get("category")
    : "All";
  const sort = params.get("sort") || "featured";
  const inStock = params.get("stock") === "true";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const change = (key, value) => {
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        if (value && value !== "All" && value !== "featured")
          next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const result = await fetchProducts({
          ...(search.trim() && { search: search.trim() }),
          ...(category !== "All" && { category }),
        });
        if (active) setProducts(result);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, category, retry]);
  const visible = useMemo(() => {
    const list = products.filter((product) => !inStock || product.stock > 0);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, inStock, sort]);
  return (
    <main className="page-shell">
      <div className="catalog-header">
        <div>
          <p className="eyebrow">A LITTLE DISCOVERY, EVERY DAY</p>
          <h1>
            Meet your next <em>favorite.</em>
          </h1>
          <p>Good design. Everyday comfort. Things worth making room for.</p>
        </div>
        <div className="catalog-count">
          <b>{loading ? "—" : visible.length}</b>
          <span>thoughtful finds</span>
        </div>
      </div>
      <div className="category-tabs" aria-label="Product categories">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            aria-pressed={category === item}
            onClick={() => change("category", item)}
          >
            {item === "All" ? "All finds" : item}
            <ArrowUpRightIcon />
          </button>
        ))}
      </div>
      <div className="catalog-toolbar">
        <div className="search-box">
          <Search size={19} />
          <input
            aria-label="Search products"
            placeholder="A lamp, a little inspiration, your next favorite…"
            value={search}
            onChange={(event) => change("search", event.target.value)}
          />
          {search && (
            <button
              aria-label="Clear search"
              onClick={() => change("search", "")}
            >
              <X size={17} />
            </button>
          )}
        </div>
        <div className="category-filter">
          <ArrowDownUp size={17} />
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => change("sort", event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>
      <div className="catalog-meta">
        <span>
          {loading
            ? "Finding your favorites…"
            : `${visible.length} products${category !== "All" ? ` in ${category}` : ""}`}
        </span>
        <label>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) =>
              change("stock", event.target.checked ? "true" : "")
            }
          />{" "}
          In stock only
        </label>
        {params.size > 0 && (
          <button onClick={() => setParams({})}>
            <X size={14} /> Reset filters
          </button>
        )}
      </div>
      {loading ? (
        <div className="product-grid" aria-label="Loading products">
          {Array.from({ length: 8 }, (_, i) => (
            <div className="skeleton-card" key={i}>
              <div />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <SlidersHorizontal size={32} />
          <h2>Let's try that again.</h2>
          <p>{error}</p>
          <button onClick={() => setRetry(retry + 1)}>Reload collection</button>
        </div>
      ) : !visible.length ? (
        <div className="empty-state">
          <Search size={32} />
          <h2>No finds this time.</h2>
          <p>Try a different search or give another collection a look.</p>
          <button onClick={() => setParams({})}>Clear filters</button>
        </div>
      ) : (
        <div className="product-grid">
          {visible.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
function ArrowUpRightIcon() {
  return <span aria-hidden="true">↗</span>;
}
