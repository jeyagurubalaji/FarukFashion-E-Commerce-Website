import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiUser, FiShoppingBag, FiPackage, FiLock, FiSettings, FiSun
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const categories = [
  'HANDBAGS', 'TROLLEY_BAGS', 'SCHOOL_BAGS', 'COLLEGE_BAGS',
  'KIDS_BAGS', 'OFFICE_BAGS', 'SLING_BAGS'
];

const MENU = [
  { id: 'account', label: 'Account', icon: FiUser },
  { id: 'orders', label: 'My Orders', icon: FiPackage, to: '/orders' },
  { id: 'cart', label: 'Cart', icon: FiShoppingBag, to: '/cart' },
  { id: 'security', label: 'Security', icon: FiLock },
  { id: 'appearances', label: 'Appearances', icon: FiSun },
  { id: 'settings', label: 'Settings', icon: FiSettings }
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [tab, setTab] = useState('account');
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    preferredCategories: user?.preferredCategories || [],
    preferredStyle: user?.preferredStyle || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      preferredCategories: f.preferredCategories.includes(cat)
        ? f.preferredCategories.filter((c) => c !== cat)
        : [...f.preferredCategories, cat]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <h1 className="section-title">My Profile</h1>
      <div className="gold-divider" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '1.5rem',
          alignItems: 'start',
          marginTop: '1.5rem'
        }}
      >
        {/* Side menu */}
        <aside
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          {MENU.map(({ id, label, icon: Icon, to }) =>
            to ? (
              <Link
                key={id}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                <Icon size={18} /> {label}
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 8,
                  border: 'none',
                  background: tab === id ? 'var(--bg-elevated)' : 'transparent',
                  color: tab === id ? 'var(--gold-dark, #a07d1a)' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} /> {label}
              </button>
            )
          )}
        </aside>

        {/* Content */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}
        >
          {tab === 'account' && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.15rem' }}>Account</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                {user?.email} · {user?.phone}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>City</label>
                  <input className="form-control" name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input className="form-control" name="state" value={form.state} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input className="form-control" name="pincode" value={form.pincode} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Preferred Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={`btn ${form.preferredCategories.includes(c) ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                    >
                      {c.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {tab === 'security' && (
            <div>
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.15rem' }}>Security</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Change your password using Forgot Password from the login page, or contact support.
              </p>
              <Link to="/forgot-password" className="btn btn-outline">
                Reset password
              </Link>
            </div>
          )}

          {tab === 'appearances' && (
              <div>
                  <h2 style={{ marginBottom: '0.75rem', fontSize: '1.15rem' }}>Appearances</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          Current theme: <strong>{isDark ? 'Dark' : 'Light'}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="button"
                            className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTheme('light')}
                          >
                            Light
                          </button>
                          <button
                            type="button"
                            className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTheme('dark')}
                          >
                            Dark
                          </button>
                        </div>
                      </div>
          )}

          {tab === 'settings' && (
            <div>
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.15rem' }}>Settings</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Manage your session and account preferences.
              </p>
              <button type="button" className="btn btn-outline" onClick={logout} style={{ color: 'var(--danger)' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}