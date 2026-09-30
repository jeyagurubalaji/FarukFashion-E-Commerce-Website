import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import PasswordInput from '../components/PasswordInput';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 email, 2 otp, 3 new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email: email.trim() });
      toast.success(res.data?.message || 'OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email: email.trim(), otp: otp.trim() });
      toast.success('OTP verified');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      toast.success('Password updated! Please sign in');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: '3rem 1.25rem' }}>
      <h1 className="section-title">Forgot Password</h1>
      <div className="gold-divider" />
      <p className="section-subtitle">
        {step === 1 && 'Enter your registered email to receive an OTP'}
        {step === 2 && 'Enter the 6-digit OTP sent to your email'}
        {step === 3 && 'Create a new password'}
      </p>

      <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', justifyContent: 'center' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: step >= s ? 'var(--gold)' : 'var(--border)'
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              OTP sent to <strong style={{ color: 'var(--cream)' }}>{email}</strong>
            </p>
            <div className="form-group">
              <label>OTP</label>
              <input
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
              onClick={() => setStep(1)}
            >
              Change email
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.85rem' }}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await authAPI.forgotPassword({ email: email.trim() });
                  toast.success('OTP resent');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Resend failed');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Resend OTP
            </button>
          </form>
        )}

                {step === 3 && (
                  <form onSubmit={resetPassword}>
                    <div className="form-group">
                      <label>New password</label>
                      <PasswordInput
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        minLength={6}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm password</label>
                      <PasswordInput
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        minLength={6}
                        autoComplete="new-password"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Updating...' : 'Reset Password'}
                  </button>
                </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}