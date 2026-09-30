import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import { mediaUrl } from '../../utils/mediaUrl';

const CATEGORIES = [
  'HANDBAGS', 'TROLLEY_BAGS', 'SCHOOL_BAGS', 'COLLEGE_BAGS',
  'KIDS_BAGS', 'OFFICE_BAGS', 'SLING_BAGS', 'TRAVELLING_KIT', 'LAPTOP_BAGS', 'OTHER'
];

const emptyForm = {
  name: '',
  description: '',
  shortDescription: '',
  category: 'HANDBAGS',
  price: '',
  discountPrice: '',
  discountPercent: '',
  gstPercent: '18',
  stockQuantity: 0,
  lowStockThreshold: 5,
  mainImage: '',
  images: [],
  colors: '',
  sizes: '',
  tags: '',
  targetAudience: 'Unisex',
  featured: false,
  active: true
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.products({ page, size: 15 })
      .then((res) => {
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      category: p.category || 'HANDBAGS',
      price: p.price ?? '',
      discountPrice: p.discountPrice ?? '',
      discountPercent: p.discountPercent ?? '',
      gstPercent: p.gstPercent ?? '18',
      stockQuantity: p.stockQuantity ?? 0,
      lowStockThreshold: p.lowStockThreshold ?? 5,
      mainImage: p.mainImage || '',
      images: p.images || [],
      colors: (p.colors || []).join(', '),
      sizes: (p.sizes || []).join(', '),
      tags: (p.tags || []).join(', '),
      targetAudience: p.targetAudience || 'Unisex',
      featured: !!p.featured,
      active: p.active !== false
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setUploading(true);
      try {
        const uploaded = [];
        for (const file of files) {
          const res = await adminAPI.uploadImage(file);
          const url = res.data.url;
          uploaded.push(url);
        }
        setForm((f) => {
          const images = [...(f.images || []), ...uploaded];
          return {
            ...f,
            images,
            mainImage: f.mainImage || uploaded[0] || ''
          };
        });
        toast.success(`${uploaded.length} image(s) uploaded`);
      } catch {
        toast.error('Image upload failed');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };

    const removeImage = (url) => {
      setForm((f) => {
        const images = (f.images || []).filter((u) => u !== url);
        const mainImage = f.mainImage === url ? (images[0] || '') : f.mainImage;
        return { ...f, images, mainImage };
      });
    };

    const setAsMain = (url) => {
      setForm((f) => ({ ...f, mainImage: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      shortDescription: form.shortDescription || form.description?.slice(0, 100),
      category: form.category,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
      gstPercent: form.gstPercent !== '' && form.gstPercent != null ? Number(form.gstPercent) : 0,
      stockQuantity: Number(form.stockQuantity),
      lowStockThreshold: Number(form.lowStockThreshold),
      mainImage: form.mainImage,
      images: form.images,
      colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      targetAudience: form.targetAudience,
      featured: form.featured,
      active: form.active
    };

    try {
      if (editing) {
        await adminAPI.updateProduct(editing.id || editing._id, payload);
        toast.success('Product updated');
      } else {
        await adminAPI.createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

    const productId = (p) => p.id || p._id;

      const handleDelete = async (p) => {
        const id = p.id || p._id;
        if (!id) return toast.error('Missing product id');
        if (!confirm('PERMANENTLY delete this product?\n\n' + (p.name || id) + '\n\nThis cannot be undone.')) return;
        try {
          await adminAPI.deleteProduct(id);
          toast.success('Product deleted permanently');
          // Remove from UI immediately
          setProducts((prev) => prev.filter((x) => (x.id || x._id) !== id));
          load();
        } catch (err) {
          console.error('Delete error', err.response);
          toast.error(err.response?.data?.message || err.message || 'Delete failed');
        }
      };

    const imgSrc = (url) => mediaUrl(url);

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>Manage inventory & catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No products. Add your first bag!</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={productId(p)}>
                      <td>
                        {p.mainImage ? (
                          <img src={imgSrc(p.mainImage)} alt="" className="thumb" />
                        ) : (
                          <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gold)' }}>FF</div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--cream)' }}>{p.name || '(No name)'}</strong>
                        {p.featured && <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>Featured</span>}
                      </td>
                      <td>{(p.category || '').toString().replace(/_/g, ' ')}</td>
                      <td>
                        ₹{Number(p.discountPrice || p.price || 0).toLocaleString('en-IN')}
                        {p.discountPrice && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: 4, fontSize: 12 }}>
                            ₹{Number(p.price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td style={{ color: p.stockQuantity <= (p.lowStockThreshold || 5) ? 'var(--danger)' : undefined }}>
                        {p.stockQuantity}
                      </td>
                      <td>
                        <span className={`badge ${p.active ? '' : 'badge-outline'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => openEdit(p)} title="Edit">
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: 6, color: 'var(--danger)' }}
                          onClick={() => handleDelete(p)}
                          title="Delete permanently"
                        >
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
              <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage((x) => x - 1)}>Prev</button>
              <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
              <button className="btn btn-outline" disabled={page >= totalPages - 1} onClick={() => setPage((x) => x + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="admin-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select className="form-control" name="targetAudience" value={form.targetAudience} onChange={handleChange}>
                    <option>Unisex</option>
                    <option>Women</option>
                    <option>Men</option>
                    <option>Kids</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} min="0" step="1" required />
                </div>
                <div className="form-group">
                  <label>Discount Price (₹)</label>
                  <input type="number" className="form-control" name="discountPrice" value={form.discountPrice} onChange={handleChange} min="0" step="1" />
                </div>
              </div>
              <div className="form-row">
                  <div className="form-group">
                      <label>GST % *</label>
                      <input
                           type="number"
                           className="form-control"
                           name="gstPercent"
                           value={form.gstPercent}
                           onChange={handleChange}
                           min="0"
                           max="28"
                           step="1"
                           placeholder="18"
                      />
                      </div>
                          <div className="form-group">
                                <label>Stock Quantity *</label>
                                <input type="number" className="form-control" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} min="0" required />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                  <label>Low Stock Alert At</label>
                      <input type="number" className="form-control" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} min="0" />
                  </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Colors (comma separated)</label>
                  <input className="form-control" name="colors" value={form.colors} onChange={handleChange} placeholder="Pink, Beige" />
                </div>
                <div className="form-group">
                  <label>Sizes (comma separated)</label>
                  <input className="form-control" name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L" />
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="elegant, travel, kids" />
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                    <FiUpload /> {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      hidden
                      disabled={uploading}
                    />
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or paste URL below</span>
                </div>
                <input
                  className="form-control"
                  style={{ marginTop: '0.5rem' }}
                  name="mainImage"
                  value={form.mainImage}
                  onChange={handleChange}
                  placeholder="https://... or /api/uploads/..."
                />
                                {(form.images || []).length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                                    {form.images.map((url) => (
                                      <div key={url} style={{ position: 'relative', width: 90, textAlign: 'center' }}>
                                        <img
                                          src={imgSrc(url)}
                                          alt=""
                                          style={{
                                            width: 90,
                                            height: 90,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            border: form.mainImage === url ? '2px solid var(--gold)' : '1px solid var(--border)',
                                            cursor: 'pointer'
                                          }}
                                          onClick={() => setAsMain(url)}
                                          title="Set as main image"
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-ghost"
                                          style={{ fontSize: 11, padding: '2px 6px', color: 'var(--danger)' }}
                                          onClick={() => removeImage(url)}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                  Select multiple files when uploading. Click a thumbnail to set main image.
                                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> Active
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}