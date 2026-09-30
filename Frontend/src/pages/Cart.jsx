import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { mediaUrl } from '../utils/mediaUrl';
export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalAmount, totalItems, totalGst, grandTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h1 className="section-title">Your Cart is Empty</h1>
        <div className="gold-divider" />
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <h1 className="section-title">Shopping Cart ({totalItems})</h1>
      <div className="gold-divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <div>
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.color}-${item.size}`}
              style={{
                display: 'flex', gap: '1.25rem', padding: '1.25rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', marginBottom: '1rem'
              }}
            >
                            <div
                              style={{
                                width: 90,
                                height: 90,
                                borderRadius: 8,
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: 'var(--bg-elevated)'
                              }}
                            >
                              {item.image ? (
                                <img
                                  src={mediaUrl(item.image)}
                                  alt={item.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    display: 'block'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--gold)'
                                  }}
                                >
                                  FF
                                </div>
                              )}
                            </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)' }}>{item.name}</h3>
                {(item.color || item.size) && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {[item.color, item.size].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p style={{ color: 'var(--gold)', fontWeight: 600, marginTop: '0.35rem' }}>
                  ₹{Number(item.price).toLocaleString('en-IN')}
                  {item.gstPercent > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                      + {item.gstPercent}% GST
                    </span>
                  )}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.3rem' }} onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}>
                    <FiMinus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button className="btn btn-outline" style={{ padding: '0.3rem' }} onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}>
                    <FiPlus size={14} />
                  </button>
                  <button className="btn btn-ghost" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => removeFromCart(item.productId, item.color, item.size)}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', position: 'sticky', top: 120 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <span>GST</span>
            <span>₹{Math.round(totalGst).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--gold)' }}>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.25rem' }}
            onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}