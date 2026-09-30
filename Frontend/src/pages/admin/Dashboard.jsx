import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader" />;
  if (!stats) return null;

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-sub">Faruk Fashion · Overview</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Products</div>
          <div className="stat-value">{stats.activeProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{stats.pendingOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">{stats.totalCustomers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue (Paid)</div>
          <div className="stat-value">₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className={`stat-card ${stats.lowStockCount > 0 ? 'warning' : ''}`}>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{stats.lowStockCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div>
          <div className="admin-toolbar">
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: 0 }}>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
              View All
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentOrders || []).length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>No orders yet</td></tr>
                ) : (
                  stats.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>{o.customerName}</td>
                      <td>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                      <td><span className="badge">{o.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="admin-toolbar">
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: 0 }}>Low Stock Alert</h3>
            <Link to="/admin/products" className="btn btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
              Manage
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {(stats.lowStockProducts || []).length === 0 ? (
                  <tr><td colSpan={2} style={{ textAlign: 'center' }}>All stock levels healthy</td></tr>
                ) : (
                  stats.lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td style={{ color: p.stockQuantity <= 5 ? 'var(--danger)' : 'var(--warning)' }}>
                        {p.stockQuantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
