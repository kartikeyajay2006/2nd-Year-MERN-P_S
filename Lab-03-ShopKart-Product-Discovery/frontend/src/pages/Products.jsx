import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { errorMessage, fetchProducts } from "../services/api";
const categories = ["", "Electronics", "Fashion", "Books", "Home"];

export default function Products() {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(async () => { setLoading(true); setError(""); try { setProducts(await fetchProducts({ ...(search && { search }), ...(category && { category }) })); } catch (err) { setError(errorMessage(err)); setProducts([]); } finally { setLoading(false); } }, 250);
    return () => clearTimeout(timer);
  }, [search, category]);
  return <main><div className="heading"><div><p>SHOPKART · LAB 03</p><h1>Discover products</h1></div></div><div className="filters"><input aria-label="Search products" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} /><select aria-label="Filter category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item || "all"} value={item}>{item || "All Categories"}</option>)}</select></div>{loading && <p className="state">Loading products...</p>}{!loading && error && <p className="state error">{error}</p>}{!loading && !error && !products.length && <p className="state">No products found.</p>}{!loading && !error && !!products.length && <section className="grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</section>}</main>;
}
