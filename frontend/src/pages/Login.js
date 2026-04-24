import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@reshoring.ai');
    setPassword('admin123');
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" className="demo-btn" onClick={fillDemo}>
              Fill Demo Credentials
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
