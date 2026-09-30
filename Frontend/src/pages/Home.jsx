import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, offerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const categoryCards = [
  { name: 'Handbags', path: 'HANDBAGS', emoji: '👜' },
  { name: 'Trolley Bags', path: 'TROLLEY_BAGS', emoji: '🧳' },
  { name: 'School Bags', path: 'SCHOOL_BAGS', emoji: '🎒' },
  { name: 'College Bags', path: 'COLLEGE_BAGS', emoji: '📚' },
  { name: 'Kids Bags', path: 'KIDS_BAGS', emoji: '🦄' },
  { name: 'Office Bags', path: 'OFFICE_BAGS', emoji: '💼' }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [feat, bans] = await Promise.all([
          productAPI.featured({ size: 8 }),
          offerAPI.banners().catch(() => ({ data: [] }))
        ]);
        setFeatured(feat.data.content || feat.data || []);
        setBanners(bans.data || []);

        if (isAuthenticated) {
          const rec = await productAPI.recommendations().catch(() => ({ data: [] }));
          setRecommended(rec.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  return (
    <div className="home">
      {/* Hero / Offers Banner */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-bismillah">In the Name of Allah</p>
          <h1>FARUK FASHION</h1>
          <p className="hero-tag">Style That Speaks</p>
          <p className="hero-desc">
            Premium Handbags · Trolley Bags · School Bags · College Bags · Kids Bags
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Shop Collection</Link>
            <Link to="/about" className="btn btn-outline">Our Story</Link>
          </div>
        </div>
        {banners.length > 0 && (
          <div className="offer-strip">
            {banners.map((b) => (
              <div key={b.id} className="offer-item">
                <strong>{b.title}</strong>
                <span>{b.description}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">Find the perfect bag for every occasion</p>
          <div className="category-grid">
            {categoryCards.map((c) => (
              <Link key={c.path} to={`/products/category/${c.path}`} className="category-card">
                <span className="cat-emoji">{c.emoji}</span>
                <span className="cat-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {recommended.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Recommended For You</h2>
            <div className="gold-divider" />
            <p className="section-subtitle">Based on your preferences</p>
            <div className="product-grid">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Best Collection</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">Handpicked premium pieces</p>
          {loading ? (
            <div className="loader" />
          ) : featured.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Products will appear here once inventory is added.
            </p>
          ) : (
            <div className="product-grid">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="trust-banner">
        <div className="container">
          <h2>Why Faruk Fashion?</h2>
          <div className="trust-grid">
            <div>
              <h3>Premium Quality</h3>
              <p>Carefully selected materials and craftsmanship</p>
            </div>
            <div>
              <h3>Durable & Stylish</h3>
              <p>Built for everyday use without compromising style</p>
            </div>
            <div>
              <h3>Wide Variety</h3>
              <p>From kids to professionals – bags for everyone</p>
            </div>
            <div>
              <h3>Trusted Service</h3>
              <p>24×7 support · Secure payments · Easy returns</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
