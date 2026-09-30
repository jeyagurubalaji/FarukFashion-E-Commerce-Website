import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PasswordInput from '../components/PasswordInput';

const categories = ['HANDBAGS', 'TROLLEY_BAGS', 'SCHOOL_BAGS', 'COLLEGE_BAGS', 'KIDS_BAGS', 'OFFICE_BAGS', 'SLING_BAGS'];

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    preferredCategories: [], preferredStyle: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
      await register(form);
      toast.success('Account created! Welcome to Faruk Fashion');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, padding: '3rem 1.25rem' }}>
      <h1 className="section-title">Create Account</h1>
      <div className="gold-divider" />
      <p className="section-subtitle">Join Faruk Fashion for personalized recommendations</p>

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>First Name</label>
            <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter the First Name" required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter the Last Name" />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Enter the Email ID" required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter the Phone Number" required />
        </div>
                <div className="form-group">
                  <label>Password</label>
                  <PasswordInput
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength={6}
                    autoComplete="new-password"
                  />
        </div>
        <div className="form-group">
          <label>Preferred Categories (for recommendations)</label>
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
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
