import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { errorMessage, fetchProducts, fetchWishlist } from "../services/api";

const categories = ["All", "Electronics", "Fashion", "Books", "Home"];
export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => { fetchWishlist().then((items) => setSavedIds(new Set(items.map((item) => item._id)))).catch(() => {}); }, []);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try { const result = await fetchProducts({ ...(search.trim() && { search: search.trim() }), ...(category !== "All" && { category }) }); if (active) setProducts(result); }
      catch (err) { if (active) setError(errorMessage(err)); }
      finally { if (active) setLoading(false); }
    }, 220);
    return () => { active = false; clearTimeout(timer); };
  }, [search, category, retry]);
  return <main className="page-shell"><div className="catalog-header"><div><p className="eyebrow">THE COLLECTION / 2026</p><h1>Find your <em>next favorite.</em></h1><p>Everyday essentials. Unexpected discoveries. All in one place.</p></div><div className="catalog-count"><b>{products.length}</b><span>curated finds</span></div></div><div className="catalog-toolbar"><div className="search-box"><Search size={19} /><input aria-label="Search products" placeholder="Search the collection..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="category-filter"><SlidersHorizontal size={18} /><select aria-label="Filter category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item} value={item}>{item === "All" ? "All categories" : item}</option>)}</select></div></div>{loading ? <div className="product-grid">{Array.from({ length: 8 }, (_, i) => <div className="skeleton-card" key={i}><div /><span /><span /></div>)}</div> : error ? <div className="empty-state"><h2>We couldn't load the collection.</h2><p>{error}</p><button onClick={() => setRetry(retry + 1)}>Try again</button></div> : !products.length ? <div className="empty-state"><Search size={30} /><h2>No matches this time.</h2><p>Try another search or category.</p><button onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button></div> : <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} saved={savedIds.has(product._id)} onSaved={(id) => setSavedIds((old) => new Set([...old, id]))} />)}</div>}</main>;
}
