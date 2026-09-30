import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiShield, FiAward, FiPackage, FiHeart } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-features">
        <div className="container footer-features-inner">
          <div className="feature">
            <FiShield size={28} />
            <div>
              <strong>Premium Quality</strong>
              <span>Crafted to last</span>
            </div>
          </div>
          <div className="feature">
            <FiAward size={28} />
            <div>
              <strong>Durable & Stylish</strong>
              <span>Style that speaks</span>
            </div>
          </div>
          <div className="feature">
            <FiPackage size={28} />
            <div>
              <strong>Wide Variety</strong>
              <span>Bags for every need</span>
            </div>
          </div>
          <div className="feature">
            <FiHeart size={28} />
            <div>
              <strong>Trusted Service</strong>
              <span>24×7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="logo-mark">FF</div>
            <h3>FARUK FASHION</h3>
            <p>Style That Speaks</p>
            <p className="footer-desc">
              Premium Handbags, Trolley Bags, School Bags, College Bags, Kids Bags,
              Office Bags, Sling Bags & Travelling Kits.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products/category/HANDBAGS">Handbags</Link>
            <Link to="/products/category/TROLLEY_BAGS">Trolley Bags</Link>
            <Link to="/products/category/SCHOOL_BAGS">School Bags</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-contact">
            <h4>Visit Us</h4>
            <p><FiMapPin /> 35, Kamarajar Street, Thenkarai,<br />Periyakulam-625 601</p>
            <p><FiPhone /> <a href="tel:+919344282751">+91 93442 82751</a></p>
            <p><FiMail /> support@farukfashion.com</p>
            <a
              href="https://wa.me/919344282751"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary footer-wa"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Faruk Fashion. All rights reserved.</p>
          <p>In the Name of Allah · Style That Speaks</p>
        </div>
      </div>
    </footer>
  );
}
