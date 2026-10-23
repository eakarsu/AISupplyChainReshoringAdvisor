import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await submitLogin(email, password);
  };

  const handleDemoLogin = async () => {
    const demoEmail = process.env.REACT_APP_DEMO_EMAIL || '';
    const demoPassword = process.env.REACT_APP_DEMO_PASSWORD || '';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    if (demoEmail && demoPassword) {
      await submitLogin(demoEmail, demoPassword);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-overlay" />
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🔗</div>
            <h1>AI Supply Chain</h1>
            <h2>Reshoring Advisor</h2>
            <p>Intelligent supply chain reshoring analysis powered by AI</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || process.env.REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL !== 'true' || !process.env.REACT_APP_DEMO_EMAIL || !process.env.REACT_APP_DEMO_PASSWORD}
              aria-label="Fill demo credentials"
              style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
            >
              Fill demo credentials
            </button>
            {(process.env.REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL !== 'true' || !process.env.REACT_APP_DEMO_EMAIL || !process.env.REACT_APP_DEMO_PASSWORD) && <p className="ai-muted">Demo credentials are not configured for this session.</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <div className="login-features">
            <div className="login-feature">
              <span>🤖</span> AI-Powered Analysis
            </div>
            <div className="login-feature">
              <span>📊</span> 15+ Supply Chain Features
            </div>
            <div className="login-feature">
              <span>🔒</span> Enterprise Security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
