import { useState } from 'react';
import { contactAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.send(form);
      toast.success('Message sent! We will respond within 24 hours.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send. Please WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <h1 className="section-title">Contact Us</h1>
      <div className="gold-divider" />
      <p className="section-subtitle">We are here 24×7 for you</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', maxWidth: 960, margin: '0 auto' }}>
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <FiMapPin color="var(--gold)" size={22} />
              <div>
                <strong style={{ color: 'var(--cream)' }}>Store Address</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                  35, Kamarajar Street, Thenkarai,<br />Periyakulam-625 601
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <FiPhone color="var(--gold)" size={22} />
              <div>
                <strong style={{ color: 'var(--cream)' }}>Phone / WhatsApp</strong>
                <p style={{ marginTop: 4 }}>
                  <a href="https://wa.me/919344282751" target="_blank" rel="noreferrer">+91 93442 82751</a>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <FiMail color="var(--gold)" size={22} />
              <div>
                <strong style={{ color: 'var(--cream)' }}>Email</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>support@farukfashion.com</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <FiClock color="var(--gold)" size={22} />
              <div>
                <strong style={{ color: 'var(--cream)' }}>Support</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>24×7 Customer Support</p>
              </div>
            </div>
          </div>
          <a href="https://wa.me/919344282751" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%' }}>
            Chat on WhatsApp
          </a>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.75rem' }}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input className="form-control" name="subject" value={form.subject} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-control" name="message" value={form.message} onChange={handleChange} rows={4} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
