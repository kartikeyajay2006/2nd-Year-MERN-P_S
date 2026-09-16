import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { errorMessage, fetchProduct } from "../services/api";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default function ProductDetails() {
  const { id } = useParams(); const [product, setProduct] = useState(null); const [error, setError] = useState("");
  useEffect(() => { fetchProduct(id).then(setProduct).catch((err) => setError(errorMessage(err))); }, [id]);
  if (error) return <main><Link to="/products">← Products</Link><p className="state error">{error}</p></main>;
  if (!product) return <main><p className="state">Loading product...</p></main>;
  return <main><Link to="/products">← Back to products</Link><article className="detail"><img src={product.image} alt={product.name} /><div><small>{product.category}</small><h1>{product.name}</h1><h2>{money.format(product.price)}</h2><p>{product.description}</p><dl><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Stock</dt><dd>{product.stock ? `${product.stock} units in stock` : "Out of stock"}</dd></div></dl><button disabled={!product.stock}>{product.stock ? "Add to Cart" : "Out of Stock"}</button><em>Cart functionality will be added in Lab 04.</em></div></article></main>;
}
