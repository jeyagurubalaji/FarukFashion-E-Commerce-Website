import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', address: '', state: '', pincode: ''
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.customers({ page, size: 20 })
      .then((res) => {
        setCustomers(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      phone: u.phone || '',
      city: u.city || '',
      address: u.address || '',
      state: u.state || '',
      pincode: u.pincode || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await adminAPI.updateCustomer(editing.id || editing._id, form);
      toast.success('Customer updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    const id = u.id || u._id;
    const isAdmin = (u.roles || []).includes('ADMIN') || u.role === 'ADMIN';
    if (isAdmin) {
      return toast.error('Cannot delete admin account from here');
    }
    if (!confirm('PERMANENTLY delete this customer?\n\n' + (u.email || id) + '\n\nThis cannot be undone.')) return;
    try {
      await adminAPI.deleteCustomer(id);
      toast.success('Customer deleted permanently');
      setCustomers((prev) => prev.filter((x) => (x.id || x._id) !== id));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">Registered users — edit or permanently delete</p>

      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Preferences</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No customers yet</td></tr>
                ) : (
                  customers.map((u) => (
                    <tr key={u.id || u._id}>
                      <td style={{ color: 'var(--cream)' }}>
                        {u.firstName} {u.lastName}
                        {((u.roles || []).includes('ADMIN') || u.role === 'ADMIN') && (
                          <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>Admin</span>
                        )}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.city || '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {(u.preferredCategories || []).slice(0, 3).map((c) => c.replace(/_/g, ' ')).join(', ') || '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{u.createdAt?.slice?.(0, 10) || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => openEdit(u)} title="Edit">
                          <FiEdit2 size={16} />
                        </button>
                        <button type="button" className="btn btn-ghost" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDelete(u)} title="Delete permanently">
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
            <h2>Edit Customer</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{editing.email}</p>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>First name</label>
                  <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Last name</label>
                  <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input className="form-control" name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input className="form-control" name="state" value={form.state} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input className="form-control" name="pincode" value={form.pincode} onChange={handleChange} />
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