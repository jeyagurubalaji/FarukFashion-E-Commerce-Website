import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(emailOrPhone, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: '3rem 1.25rem' }}>
      <h1 className="section-title">Login</h1>
      <div className="gold-divider" />
      <p className="section-subtitle">Access your Faruk Fashion account</p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="form-group">
          <label>Email or Phone</label>
          <input
            className="form-control"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="email@example.com or 9876543210"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.25rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}
        >
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          OR
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <a
          href={`${API}/oauth2/authorization/google`}
          className="btn btn-outline"
          style={{ width: '100%', textDecoration: 'none' }}
        >
          Continue with Google
        </a>

        <p style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>
            Forgot password?
          </Link>
        </p>
        <p
          style={{
            textAlign: 'center',
            marginTop: '0.75rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}
        >
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}