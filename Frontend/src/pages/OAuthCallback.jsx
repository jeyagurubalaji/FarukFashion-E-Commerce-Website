import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      toast.error('Google login failed');
      navigate('/login');
      return;
    }

    localStorage.setItem('ff_token', token);

    api.get('/auth/me')
      .then((res) => {
        localStorage.setItem('ff_user', JSON.stringify(res.data));
        toast.success('Welcome!');
        navigate('/');
        window.location.reload();
      })
      .catch(() => {
        localStorage.removeItem('ff_token');
        toast.error('Could not complete Google login');
        navigate('/login');
      });
  }, [params, navigate]);

  return (
    <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="loader" />
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Signing you in with Google...</p>
    </div>
  );
}