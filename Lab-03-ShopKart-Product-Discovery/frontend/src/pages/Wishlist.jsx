import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddCartButton from "../components/AddCartButton";
import { errorMessage, fetchWishlist, removeWishlist } from "../services/api";
import { money } from "../utils/format";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await fetchWishlist()); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const remove = async (id) => { setBusyId(id); setError(""); try { await removeWishlist(id); setItems((old) => old.filter((item) => item._id !== id)); } catch (err) { setError(errorMessage(err)); } finally { setBusyId(""); } };
  return <main className="page-shell"><div className="page-heading"><div><p className="eyebrow">SAVED FOR LATER</p><h1>Your wishlist<span>.</span></h1><p>{items.length} {items.length === 1 ? "item" : "items"} you love, all in one place.</p></div><Link className="text-link" to="/products">Continue shopping <ArrowRight size={17} /></Link></div>{error && <div className="alert" role="alert">{error}{loading || items.length === 0 ? <button onClick={load}>Try again</button> : null}</div>}{loading ? <div className="empty-state">Loading your wishlist...</div> : !error && items.length === 0 ? <div className="empty-state"><div className="empty-icon"><Heart size={36} /></div><h2>Your wishlist is waiting.</h2><p>Save products you love and find them here later.</p><Link className="primary-link" to="/products">Browse products <ArrowRight size={18} /></Link></div> : <div className="product-grid wishlist-grid">{items.map((product) => <article className="product-card" key={product._id}><Link className="product-image" to={`/products/${product._id}`}><img src={product.image} alt={product.name} /><span className="product-badge">{product.category}</span></Link><div className="product-info"><h3>{product.name}</h3><p className={product.stock ? "stock-label" : "stock-label unavailable"}>{product.stock ? `${product.stock} available` : "Out of stock"}</p><strong>{money(product.price)}</strong><div className="wishlist-actions"><Link to={`/products/${product._id}`} className="outline-link">View details</Link><button className="remove-link" disabled={busyId === product._id} onClick={() => remove(product._id)} aria-label={`Remove ${product.name} from wishlist`}><Trash2 size={17} />{busyId === product._id ? "Removing..." : "Remove"}</button></div><AddCartButton product={product} compact /></div></article>)}</div>}</main>;
}
