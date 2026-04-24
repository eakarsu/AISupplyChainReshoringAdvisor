import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FEATURES } from '../App';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const results = await Promise.all(
          FEATURES.map(f => api.get(f.api).then(r => ({ key: f.key, count: r.data.length })).catch(() => ({ key: f.key, count: 0 })))
        );
        const s = {};
        results.forEach(r => s[r.key] = r.count);
        setStats(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Supply Chain Reshoring Dashboard</h1>
          <p className="page-subtitle">AI-powered insights for strategic reshoring decisions</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-value">{Object.values(stats).reduce((a, b) => a + b, 0)}</div>
              <div className="stat-label">Total Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats['suppliers'] || 0}</div>
              <div className="stat-label">Active Suppliers</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{stats['risk-assessments'] || 0}</div>
              <div className="stat-label">Risk Assessments</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{stats['compliance-checks'] || 0}</div>
              <div className="stat-label">Compliance Checks</div>
            </div>
          </div>

          <h2 className="section-title">Feature Overview</h2>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div
                key={f.key}
                className="feature-card"
                onClick={() => navigate(`/${f.key}`)}
                style={{ borderTopColor: f.color }}
              >
                <div className="feature-card-icon" style={{ background: f.color + '15', color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.label}</h3>
                <div className="feature-card-count">
                  <span className="count-value">{stats[f.key] || 0}</span> records
                </div>
                <div className="feature-card-arrow">→</div>
              </div>
            ))}
          </div>

          <div className="ai-banner" onClick={() => navigate('/ai-center')}>
            <div className="ai-banner-content">
              <div className="ai-banner-icon">🤖</div>
              <div>
                <h3>AI Command Center</h3>
                <p>Chat with AI, generate reports, simulate scenarios, get market intelligence, and monitor risks</p>
              </div>
            </div>
            <div className="ai-banner-arrow">→</div>
          </div>
        </>
      )}
    </div>
  );
}
