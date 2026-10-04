import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoImg from '../assets/logo.png';
import './Navbar.css';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiSearch, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const categories = [
  { label: 'Handbags', value: 'HANDBAGS' },
  { label: 'Trolley Bags', value: 'TROLLEY_BAGS' },
  { label: 'School Bags', value: 'SCHOOL_BAGS' },
  { label: 'College Bags', value: 'COLLEGE_BAGS' },
  { label: 'Kids Bags', value: 'KIDS_BAGS' },
  { label: 'Office Bags', value: 'OFFICE_BAGS' },
  { label: 'Sling Bags', value: 'SLING_BAGS' },
  { label: 'Travelling Kit', value: 'TRAVELLING_KIT' },
  { label: 'Laptop Bags', value: 'LAPTOP_BAGS' },
  { label: 'Other', value: 'OTHER' }
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const displayName = user?.fullName || user?.firstName || user?.email || 'Profile';
  const isAdmin =
    user?.role === 'ADMIN' ||
    (Array.isArray(user?.roles) && user.roles.includes('ADMIN'));

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <a
            href="https://wa.me/919344282751"
            target="_blank"
            rel="noreferrer"
            className="navbar-whatsapp"
          >
            WhatsApp: +91 93442 82751
          </a>
          <span className="navbar-bismillah">IN THE NAME OF ALLAH</span>
          <span className="navbar-top-spacer" />
        </div>
      </div>

      <div className="navbar-main">
        <div className="container navbar-main-inner">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img src={logoImg} alt="Faruk Fashion" className="logo-img" />
            <div className="logo-text">
              <span className="logo-name">FARUK FASHION</span>
              <span className="logo-tag">Best Collection</span>
            </div>
          </Link>

          {/* Desktop Actions */}
          <div className="navbar-actions desktop-only">
            <button
              type="button"
              className="nav-icon"
              onClick={toggleTheme}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            <Link to="/cart" className="nav-icon" title="Cart">
              <FiShoppingBag size={22} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-outline nav-login"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  >
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="nav-profile" title="My Profile">
                  <FiUser size={20} />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 120
                    }}
                  >
                    {displayName}
                  </span>
                </Link>
                <button type="button" className="nav-icon" onClick={logout} title="Logout">
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-profile">
                Login
              </Link>
            )}
          </div>

          {/* Desktop Search Form */}
          <form className="search-form desktop-only" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search bags, trolleys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <FiSearch size={18} />
            </button>
          </form>

          {/* Mobile Header Controls */}
          <div className="mobile-only-controls">
            <button
              type="button"
              className="nav-icon"
              onClick={toggleTheme}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <Link to="/cart" className="nav-icon" title="Cart" onClick={() => setMenuOpen(false)}>
              <FiShoppingBag size={22} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Links + Mobile Drawer */}
      <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <div className="container">
          {/* 1. Home */}
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>

          {/* 2. Mobile Search Bar (Right after Home) */}
          <form className="search-form mobile-only" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search bags, trolleys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <FiSearch size={18} />
            </button>
          </form>

          {/* 3. Category Links */}
          {categories.map((c) => (
            <NavLink
              key={c.value}
              to={`/products/category/${c.value}`}
              onClick={() => setMenuOpen(false)}
            >
              {c.label}
            </NavLink>
          ))}

          <NavLink to="/about" onClick={() => setMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </NavLink>

          {/* 4. My Orders */}
          {isAuthenticated && (
            <NavLink to="/orders" onClick={() => setMenuOpen(false)}>
              My Orders
            </NavLink>
          )}

          {/* 5. Profile & Logout Section (Positioned at the end) */}
          <div className="mobile-user-section mobile-only">
            {isAuthenticated ? (
              <div className="mobile-user-container">
                <Link
                  to="/profile"
                  className="mobile-profile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser size={18} />
                  <span>{displayName}</span>
                </Link>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="mobile-admin-link"
                  >
                    Admin Panel
                  </NavLink>
                )}

                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <FiLogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="mobile-login-link"
                onClick={() => setMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}