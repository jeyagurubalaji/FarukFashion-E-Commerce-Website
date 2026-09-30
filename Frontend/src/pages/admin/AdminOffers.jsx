import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const empty = {
  title: '',
  description: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderValue: '',
  startDate: '',
  endDate: '',
  active: true,
  showOnHomeBanner: true,
  displayOrder: 0,
  couponCode: ''
};

function toInputDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toApiDate(local) {
  if (!local) return null;
  return new Date(local).toISOString();
}

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.offers()
      .then((res) => setOffers(res.data || []))
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    setForm({
      ...empty,
      startDate: toInputDate(now.toISOString()),
      endDate: toInputDate(end.toISOString())
    });
    setShowModal(true);
  };

  const openEdit = (o) => {
    setEditing(o);
    setForm({
      title: o.title || '',
      description: o.description || '',
      type: o.type || 'PERCENTAGE',
      value: o.value ?? '',
      minOrderValue: o.minOrderValue ?? '',
      startDate: toInputDate(o.startDate),
      endDate: toInputDate(o.endDate),
      active: o.active !== false,
      showOnHomeBanner: o.showOnHomeBanner !== false,
      displayOrder: o.displayOrder ?? 0,
      couponCode: o.couponCode || ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      value: form.value !== '' ? Number(form.value) : null,
      minOrderValue: form.minOrderValue !== '' ? Number(form.minOrderValue) : null,
      startDate: toApiDate(form.startDate),
      endDate: toApiDate(form.endDate),
      active: form.active,
      showOnHomeBanner: form.showOnHomeBanner,
      displayOrder: Number(form.displayOrder) || 0,
      couponCode: form.couponCode || null
    };
    try {
      if (editing) {
        await adminAPI.updateOffer(editing.id || editing._id, payload);
        toast.success('Offer updated');
      } else {
        await adminAPI.createOffer(payload);
        toast.success('Offer created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o) => {
    const id = o.id || o._id;
    if (!confirm('Delete this offer?\n\n' + (o.title || id))) return;
    try {
      await adminAPI.deleteOffer(id);
      toast.success('Offer deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const isLive = (o) => {
    if (!o.active || !o.showOnHomeBanner) return false;
    const now = Date.now();
    const s = o.startDate ? new Date(o.startDate).getTime() : 0;
    const e = o.endDate ? new Date(o.endDate).getTime() : Infinity;
    return now >= s && now <= e;
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h1 className="admin-page-title">Offers / Gold Banner</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Change the gold strip on the home page. Set start and end dates
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Offer
        </button>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Start</th>
                <th>End</th>
                <th>On Home</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    No offers yet. Click Add Offer to create the gold banner text.
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr key={o.id || o._id}>
                    <td><strong style={{ color: 'var(--cream)' }}>{o.title}</strong></td>
                    <td style={{ maxWidth: 220 }}>{o.description}</td>
                    <td style={{ fontSize: 12 }}>{o.startDate ? new Date(o.startDate).toLocaleString() : '—'}</td>
                    <td style={{ fontSize: 12 }}>{o.endDate ? new Date(o.endDate).toLocaleString() : '—'}</td>
                    <td>{o.showOnHomeBanner ? 'Yes' : 'No'}</td>
                    <td>
                      <span className={`badge ${isLive(o) ? '' : 'badge-outline'}`}>
                        {isLive(o) ? 'LIVE on site' : o.active ? 'Scheduled / ended' : 'Off'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => openEdit(o)} title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button type="button" className="btn btn-ghost" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDelete(o)} title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <h2>{editing ? 'Edit Offer' : 'Add Offer'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Title and description appear on the gold bar under the home hero. Use dates to show only on chosen days.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title * (e.g. Festival Special)</label>
                <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description * (e.g. Flat 15% OFF on Handbags)</label>
                <input className="form-control" name="description" value={form.description} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start date and time *</label>
                  <input type="datetime-local" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End date and time *</label>
                  <input type="datetime-local" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" name="type" value={form.type} onChange={handleChange}>
                    <option value="PERCENTAGE">Percentage off</option>
                    <option value="FLAT">Flat Rs off</option>
                    <option value="FREE_SHIPPING">Free shipping</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value (optional)</label>
                  <input type="number" className="form-control" name="value" value={form.value} onChange={handleChange} placeholder="15" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min order Rs (optional)</label>
                  <input type="number" className="form-control" name="minOrderValue" value={form.minOrderValue} onChange={handleChange} placeholder="999" />
                </div>
                <div className="form-group">
                  <label>Display order</label>
                  <input type="number" className="form-control" name="displayOrder" value={form.displayOrder} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" name="showOnHomeBanner" checked={form.showOnHomeBanner} onChange={handleChange} />
                  Show on home gold banner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}