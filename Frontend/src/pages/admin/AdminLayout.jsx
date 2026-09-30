import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiLogOut, FiHome, FiMenu, FiX, FiTag
} from 'react-icons/fi';
import { useState } from 'react';
import './Admin.css';
import logoImg from '../../assets/logo.png';

const links = [
  { to: '/admin', end: true, icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: FiUsers, label: 'Customers' },
  { to: '/admin/offers', icon: FiTag, label: 'Offers' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <img src={logoImg} alt="Faruk Fashion" className="admin-logo-img" />
          <div>
            <strong>Faruk Fashion</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink to="/" onClick={() => setSidebarOpen(false)}>
            <FiHome size={18} /> Store Front
          </NavLink>
          <button type="button" onClick={handleLogout}>
            <FiLogOut size={18} /> Logout
          </button>
          <p className="admin-user">{user?.email || user?.fullName}</p>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
