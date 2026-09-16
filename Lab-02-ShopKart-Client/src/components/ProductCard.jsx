import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function ProductCard({ product }) {
  const isOutOfStock = product.stock === 0;

  return (
    <article className="product-card">
      <img className="product-card__image" src={product.image} alt={product.name} />
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-card__price">{money.format(product.price)}</p>
        <p className={isOutOfStock ? "stock stock--out" : "stock"}>
          {isOutOfStock ? "Out of stock" : `${product.stock} units left`}
        </p>
        <Link className="btn product-card__action" to={`/products/${product._id}`}>View Details</Link>
      </div>
    </article>
  );
}
