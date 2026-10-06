import { ArrowLeft, Check, Heart, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AddCartButton from "../components/AddCartButton";
import WishlistButton from "../components/WishlistButton";
import { errorMessage, fetchProduct, fetchWishlist } from "../services/api";
import { money } from "../utils/format";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setProduct(null); setError(""); fetchProduct(id).then(setProduct).catch((err) => setError(errorMessage(err))); fetchWishlist().then((items) => setSaved(items.some((item) => item._id === id))).catch(() => {}); }, [id]);
  if (error) return <main className="page-shell"><Link to="/products">← Back to shop</Link><div className="empty-state"><h2>We couldn't find this product.</h2><p>{error}</p></div></main>;
  if (!product) return <main className="page-shell"><div className="empty-state">Loading product...</div></main>;
  return <main className="page-shell"><Link className="back-link" to="/products"><ArrowLeft size={17} /> Back to collection</Link><div className="detail-layout"><div className="detail-image"><img src={product.image} alt={product.name} /></div><div className="detail-info"><p className="eyebrow">SHOPKART / {product.category.toUpperCase()}</p><h1>{product.name}</h1><p className="detail-price">{money(product.price)}</p><div className="detail-divider" /><p className="detail-description">{product.description}</p><p className={product.stock ? "detail-stock" : "detail-stock unavailable"}><Check size={17} />{product.stock ? `${product.stock} in stock · ready to add` : "Currently out of stock"}</p><div className="detail-actions"><AddCartButton product={product} /><WishlistButton id={product._id} saved={saved} onSaved={() => setSaved(true)} /></div><div className="detail-benefits"><span><Truck size={20} /> Thoughtfully curated products</span><span><ShoppingBag size={20} /> Secure Razorpay checkout</span><span><Heart size={20} /> Save favorites for later</span></div></div></div></main>;
}
