import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export default function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="brand" to="/home">
            shopkart<span className="brand-period">.</span>
          </Link>
          <p>
            Good finds for the way you live.
            <br />A little more you, every day.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>EXPLORE</span>
            <Link to="/products">
              The collection <ArrowUpRight size={14} />
            </Link>
            <Link to="/products?category=Home">Home & living</Link>
            <Link to="/products?category=Electronics">Everyday tech</Link>
          </div>
          <div>
            <span>YOUR SHOPKART</span>
            <Link to="/wishlist">Saved finds</Link>
            <Link to="/cart">Shopping bag</Link>
            <Link to="/orders">My orders</Link>
          </div>
        </div>
        <div className="footer-note">
          <span>THOUGHTFULLY PICKED.</span>
          <p>Beautifully everyday.</p>
          <small>Made for the little moments.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <small>
          © {new Date().getFullYear()} ShopKart. MERN assignment by Kartikeya
          Yadav.
        </small>
        <span>React · Express · MongoDB</span>
        <a href="#main-content">Back to top ↑</a>
      </div>
    </footer>
  );
}
