import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AiCenter from './pages/AiCenter';
import DetailPage from './pages/DetailPage';

const FEATURES = [
  { key: 'suppliers', label: 'Supplier Discovery', icon: '🏭', api: '/suppliers', color: '#3b82f6' },
  { key: 'risk-assessments', label: 'Risk Assessment', icon: '⚠️', api: '/risk-assessments', color: '#ef4444' },
  { key: 'cost-analysis', label: 'Cost Analysis', icon: '💰', api: '/cost-analysis', color: '#10b981' },
  { key: 'tariff-calculations', label: 'Tariff Calculator', icon: '📊', api: '/tariff-calculations', color: '#f59e0b' },
  { key: 'supply-chain-maps', label: 'Supply Chain Mapping', icon: '🗺️', api: '/supply-chain-maps', color: '#8b5cf6' },
  { key: 'compliance-checks', label: 'Compliance Checker', icon: '✅', api: '/compliance-checks', color: '#06b6d4' },
  { key: 'transport-routes', label: 'Route Optimizer', icon: '🚛', api: '/transport-routes', color: '#ec4899' },
  { key: 'workforce-plans', label: 'Workforce Planning', icon: '👷', api: '/workforce-plans', color: '#f97316' },
  { key: 'site-selections', label: 'Site Selection', icon: '📍', api: '/site-selections', color: '#14b8a6' },
  { key: 'inventory', label: 'Inventory Optimization', icon: '📦', api: '/inventory', color: '#6366f1' },
  { key: 'demand-forecasts', label: 'Demand Forecasting', icon: '📈', api: '/demand-forecasts', color: '#84cc16' },
  { key: 'quality-assessments', label: 'Quality Assessment', icon: '🔍', api: '/quality-assessments', color: '#a855f7' },
  { key: 'environmental-impacts', label: 'Environmental Impact', icon: '🌿', api: '/environmental-impacts', color: '#22c55e' },
  { key: 'trade-agreements', label: 'Trade Agreements', icon: '🤝', api: '/trade-agreements', color: '#0ea5e9' },
  { key: 'budget-plans', label: 'Budget Planning', icon: '💵', api: '/budget-plans', color: '#eab308' },
];

export { FEATURES };

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(`/${path}`);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/dashboard')}>
            {!sidebarCollapsed && <h2>🔗 Reshoring AI</h2>}
            {sidebarCollapsed && <span className="logo-icon">🔗</span>}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">{!sidebarCollapsed && 'Dashboard'}</div>
            <button
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <span className="nav-icon">📊</span>
              {!sidebarCollapsed && <span>Overview</span>}
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">{!sidebarCollapsed && 'Features'}</div>
            {FEATURES.map(f => (
              <button
                key={f.key}
                className={`nav-item ${isActive(f.key) ? 'active' : ''}`}
                onClick={() => navigate(`/${f.key}`)}
              >
                <span className="nav-icon">{f.icon}</span>
                {!sidebarCollapsed && <span>{f.label}</span>}
              </button>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">{!sidebarCollapsed && 'AI Center'}</div>
            <button
              className={`nav-item ai-center-btn ${isActive('ai-center') ? 'active' : ''}`}
              onClick={() => navigate('/ai-center')}
            >
              <span className="nav-icon">🤖</span>
              {!sidebarCollapsed && <span>AI Command Center</span>}
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          {user && !sidebarCollapsed && (
            <div className="user-info">
              <div className="user-avatar">{user.name?.[0] || 'A'}</div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            {sidebarCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          {FEATURES.map(f => (
            <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} />} />
          ))}
          {FEATURES.map(f => (
            <Route key={`${f.key}-detail`} path={`/${f.key}/:id`} element={<DetailPage feature={f} />} />
          ))}
          <Route path="/ai-center" element={<AiCenter />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> :
          <Login onLogin={() => setIsAuthenticated(true)} />
        } />
        <Route path="/*" element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;
