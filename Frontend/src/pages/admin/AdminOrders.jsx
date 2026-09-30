import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED',
  'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'
];

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    status: '', paymentStatus: '', notes: '', trackingNumber: '', courierName: ''
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = { page, size: 15 };
    if (statusFilter) params.status = statusFilter;
    adminAPI.orders(params)
      .then((res) => {
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      toast.success(`Order updated to ${status}`);
      load();
    } catch {
      toast.error('Status update failed');
    }
  };

  const openEdit = (o) => {
    setEditing(o);
    setForm({
      status: o.status || 'PENDING',
      paymentStatus: o.paymentStatus || 'PENDING',
      notes: o.notes || '',
      trackingNumber: o.trackingNumber || '',
      courierName: o.courierName || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await adminAPI.updateOrder(editing.id || editing._id, {
        status: form.status,
        paymentStatus: form.paymentStatus,
        notes: form.notes,
        trackingNumber: form.trackingNumber,
        courierName: form.courierName
      });
      toast.success('Order updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o) => {
    const id = o.id || o._id;
    if (!confirm('PERMANENTLY delete this order?\n\n' + (o.orderNumber || id) + '\n\nThis cannot be undone.')) return;
    try {
      await adminAPI.deleteOrder(id);
      toast.success('Order deleted permanently');
      setOrders((prev) => prev.filter((x) => (x.id || x._id) !== id));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>
      <p className="admin-page-sub">Manage customer orders & shipping</p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 160 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No orders found</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id || o._id}>
                      <td>
                        <strong style={{ color: 'var(--gold)' }}>{o.orderNumber}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {o.createdAt?.slice?.(0, 10) || o.createdAt}
                        </div>
                      </td>
                      <td>
                        <div>{o.customerName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.customerPhone}</div>
                      </td>
                      <td>{o.items?.length || 0} item(s)</td>
                      <td>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className="badge-outline badge">{o.paymentStatus}</span>
                        <div style={{ fontSize: 11, marginTop: 2 }}>{o.paymentMethod}</div>
                      </td>
                      <td><span className="badge">{o.status}</span></td>
                      <td>
                        <select
                          className="status-select"
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id || o._id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => openEdit(o)} title="Edit">
                          <FiEdit2 size={16} />
                        </button>
                        <button type="button" className="btn btn-ghost" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDelete(o)} title="Delete permanently">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
              <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
              <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
              <button className="btn btn-outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="admin-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="admin-modal">
            <h2>Edit Order {editing.orderNumber}</h2>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment status</label>
                  <select className="form-control" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Courier</label>
                  <input className="form-control" value={form.courierName} onChange={(e) => setForm({ ...form, courierName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tracking number</label>
                  <input className="form-control" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}