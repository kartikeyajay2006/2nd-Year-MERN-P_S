import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { fetchProducts, errorMessage } from "../services/api";
import ProductCard from "../components/ProductCard";
const collections = [
  {
    name: "Home",
    title: "A space that feels like you.",
    label: "THE SLOW LIVING EDIT",
    image: "/images/hero-living-room.jpg",
  },
  {
    name: "Electronics",
    title: "Make your everyday smarter.",
    label: "WORK. PLAY. REPEAT.",
    image: "/images/collection-tech.jpg",
  },
  {
    name: "Fashion",
    title: "Your everyday, reimagined.",
    label: "THE PERSONAL STYLE EDIT",
    image: "/images/collection-fashion.jpg",
  },
  {
    name: "Books",
    title: "Turn a page. Find a world.",
    label: "FOR THE CURIOUS MIND",
    image: "/images/collection-books.jpg",
  },
];
export default function Home() {
  const { customer } = useAuth();
  const { count } = useCart();
  const { savedIds } = useShop();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    fetchProducts()
      .then((items) => {
        if (active)
          setProducts(items.filter((item) => item.stock > 0).slice(0, 4));
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [retry]);
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            <span className="live-dot" /> THE ART OF EVERYDAY LIVING
          </p>
          <h1>
            Less ordinary.
            <br />
            <em>More you.</em>
          </h1>
          <p>
            A considered collection for the little moments that make life feel
            good. Find something that feels like you.
          </p>
          <Link className="primary-link" to="/products">
            Discover your next favorite <ArrowUpRight size={19} />
          </Link>
          <div className="hero-proof">
            <div className="proof-symbol">
              <Sparkles size={22} />
            </div>
            <span>
              Thoughtfully picked.
              <br />
              <b>Beautifully everyday.</b>
            </span>
            <span className="hero-index">01 — THE EVERYDAY EDIT</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/hero-living-room.jpg"
            alt="Warm, sunlit living room with a comfortable sofa and natural textures"
            fetchPriority="high"
          />
          <span className="hero-photo-label">
            A LITTLE ROOM FOR GOOD THINGS
          </span>
          <Link to="/products?category=Home" className="hero-caption">
            <span>THE HOME COLLECTION</span>
            <b>Make yourself at home.</b>
            <ArrowUpRight size={22} />
          </Link>
          <span className="hero-number" aria-hidden="true">
            01 / 04
          </span>
        </div>
      </section>
      <section className="trust-strip" aria-label="Shopping benefits">
        <span>
          <Sparkles size={20} /> A thoughtfully curated collection
        </span>
        <span>
          <Truck size={20} /> Complimentary shipping
        </span>
        <span>
          <ShieldCheck size={20} /> Secure checkout & cash on delivery
        </span>
      </section>
      <section className="home-sections">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR KIND OF GOOD</p>
            <h2>
              Everyday, <em>elevated.</em>
            </h2>
          </div>
          <Link className="text-link" to="/products">
            Explore all collections <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="collection-grid">
          {collections.map((collection, i) => (
            <Link
              key={collection.name}
              className="collection-card"
              to={`/products?category=${collection.name}`}
            >
              <img
                src={collection.image}
                alt={`${collection.name} collection`}
                loading="lazy"
              />
              <div className="collection-overlay">
                <span className="collection-index">
                  0{i + 1} / {collection.name.toUpperCase()}
                </span>
                <div>
                  <p>{collection.title}</p>
                  <span className="collection-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <small>{collection.label}</small>
              </div>
            </Link>
          ))}
        </div>
        <div className="section-heading featured-heading">
          <div>
            <p className="eyebrow">THE GOOD FINDS</p>
            <h2>
              A few things <em>we love.</em>
            </h2>
          </div>
          <Link className="text-link" to="/products">
            Shop the collection <ArrowRight size={18} />
          </Link>
        </div>
        {error ? (
          <div className="empty-state">
            <p>{error}</p>
            <button onClick={() => setRetry(retry + 1)}>Try again</button>
          </div>
        ) : (
          <div className="product-grid">
            {products.length
              ? products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              : Array.from({ length: 4 }, (_, i) => (
                  <div className="skeleton-card" key={i}>
                    <div />
                    <span />
                    <span />
                  </div>
                ))}
          </div>
        )}
        <section className="editorial-banner">
          <div>
            <p className="eyebrow">
              A LITTLE LESS SCROLLING. A LITTLE MORE LIVING.
            </p>
            <h2>
              Good things belong
              <br />
              in your <em>everyday.</em>
            </h2>
            <p>
              From the first coffee to the last chapter. Make those little
              moments your own.
            </p>
            <Link className="primary-link" to="/products">
              Find your good thing <ArrowUpRight size={18} />
            </Link>
          </div>
          <span className="editorial-art" aria-hidden="true">
            s<span>k.</span>
            <Sparkles size={45} />
          </span>
        </section>
        {customer && (
          <section className="personal-section">
            <div className="section-intro">
              <p className="eyebrow">YOUR OWN LITTLE CORNER</p>
              <h2>Make yourself at home, {customer.fullName.split(" ")[0]}.</h2>
              <p>Pick up right where you left off.</p>
            </div>
            <div className="quick-grid">
              <Link to="/wishlist" className="quick-card">
                <Heart size={24} />
                <span>
                  Your saved finds <b>{savedIds.size}</b>
                </span>
                <p>Keep the good things close.</p>
                <ArrowUpRight size={20} />
              </Link>
              <Link to="/cart" className="quick-card">
                <ShoppingBag size={24} />
                <span>
                  Your shopping bag <b>{count}</b>
                </span>
                <p>A little something to look forward to.</p>
                <ArrowUpRight size={20} />
              </Link>
              <Link to="/orders" className="quick-card">
                <PackageCheck size={24} />
                <span>Your orders</span>
                <p>Every good find, in one place.</p>
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
