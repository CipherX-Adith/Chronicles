import React, { useState } from 'react';
import { api } from '../lib/api';

interface AdminLoginProps {
  onLoginSuccess: (token: string, admin: any) => void;
  showToast: (msg: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  showToast,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.adminLogin(email, password);
      onLoginSuccess(res.token, res.admin);
      showToast('Welcome back, Admin.');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto 90px' }}>
      <div className="admin-submission-card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="eyebrow">EDITORIAL ACCESS</span>
          <h2 style={{ fontSize: '28px', letterSpacing: '-0.04em' }}>
            Admin Sign In
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Internal submission review & Instagram publishing desk.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@untoldletterbox.com"
              required
            />
          </div>

          <div>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'AUTHENTICATING...' : 'SIGN IN →'}
          </button>
        </form>
      </div>
    </div>
  );
};
