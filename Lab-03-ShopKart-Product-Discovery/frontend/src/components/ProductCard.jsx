import { Link } from "react-router-dom";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default function ProductCard({ product }) {
  return <article className="card"><img src={product.image} alt={product.name} /><div><small>{product.category}</small><h2>{product.name}</h2><strong>{money.format(product.price)}</strong><p className={product.stock ? "stock" : "out"}>{product.stock ? `${product.stock} units left` : "Out of stock"}</p><Link className="button" to={`/products/${product._id}`}>View Details</Link></div></article>;
}
