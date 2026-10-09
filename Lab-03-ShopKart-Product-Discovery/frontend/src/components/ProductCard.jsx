import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import AddCartButton from "./AddCartButton";
import WishlistButton from "./WishlistButton";
import ProductImage from "./ProductImage";
import { money } from "../utils/format";
export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/products/${product._id}`}>
          <ProductImage src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <span className="product-badge">{product.category}</span>
        <div className="floating-wish">
          <WishlistButton id={product._id} compact />
        </div>
        {!product.stock && <span className="sold-out">Currently sold out</span>}
      </div>
      <div className="product-info">
        <div className="product-title-row">
          <Link to={`/products/${product._id}`}>
            <h3>{product.name}</h3>
          </Link>
          <ArrowUpRight size={17} />
        </div>
        <p
          className={product.stock ? "stock-label" : "stock-label unavailable"}
        >
          <span />
          {product.stock
            ? product.stock <= 5
              ? `Only ${product.stock} left`
              : "In stock"
            : "Out of stock"}
        </p>
        <div className="product-bottom">
          <strong>{money(product.price)}</strong>
          <Link to={`/products/${product._id}`}>
            Explore <ArrowUpRight size={14} />
          </Link>
        </div>
        <AddCartButton product={product} compact />
      </div>
    </article>
  );
}
