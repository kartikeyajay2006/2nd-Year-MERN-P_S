import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import AddCartButton from "./AddCartButton";
import WishlistButton from "./WishlistButton";
import { money } from "../utils/format";

export default function ProductCard({ product, saved, onSaved }) {
  return <article className="product-card"><div className="product-image"><Link to={`/products/${product._id}`}><img src={product.image} alt={product.name} loading="lazy" /></Link><span className="product-badge">{product.category}</span><div className="floating-wish"><WishlistButton id={product._id} saved={saved} onSaved={onSaved} compact /></div></div><div className="product-info"><div className="product-title-row"><Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link><ArrowUpRight size={18} /></div><p className={product.stock ? "stock-label" : "stock-label unavailable"}>{product.stock ? `${product.stock} available` : "Out of stock"}</p><div className="product-bottom"><strong>{money(product.price)}</strong><Link to={`/products/${product._id}`}>Details →</Link></div><AddCartButton product={product} compact /></div></article>;
}
