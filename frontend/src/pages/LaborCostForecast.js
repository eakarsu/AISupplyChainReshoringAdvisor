import React, { useState } from 'react';
import api from '../services/api';
import AiAnalysisDisplay from '../components/AiAnalysisDisplay';

export default function LaborCostForecast() {
  const [form, setForm] = useState({
    country: '',
    region: '',
    industry: '',
    horizon_years: 5,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const payload = {
        country: form.country,
        region: form.region || undefined,
        industry: form.industry || undefined,
        horizon_years: Number(form.horizon_years) || 5,
      };
      const res = await api.post('/ai/labor-cost-forecast', payload);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Forecast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>💼 Labor Cost Forecast</h1>
          <p className="page-subtitle">AI-driven labor cost trajectory by country/industry.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="form-group">
            <label>Country *</label>
            <input className="form-input" type="text" required value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="e.g. United States" />
          </div>
          <div className="form-group">
            <label>Region</label>
            <input className="form-input" type="text" value={form.region} onChange={(e) => handleChange('region', e.target.value)} placeholder="e.g. Midwest" />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <input className="form-input" type="text" value={form.industry} onChange={(e) => handleChange('industry', e.target.value)} placeholder="e.g. semiconductors" />
          </div>
          <div className="form-group">
            <label>Horizon (years)</label>
            <input className="form-input" type="number" min={1} max={20} value={form.horizon_years} onChange={(e) => handleChange('horizon_years', e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn btn-ai-submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? '🔄 Forecasting...' : '🚀 Run Forecast'}
        </button>
      </form>

      {error && <div className="ai-result" style={{ borderColor: '#ef4444', color: '#b91c1c', padding: 12, marginBottom: 16 }}>{error}</div>}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <p>AI is forecasting labor costs...</p>
        </div>
      )}

      {result && !loading && (
        <div className="ai-result">
          <div className="ai-result-header"><h3>Forecast</h3></div>
          <AiAnalysisDisplay content={typeof result === 'string' ? result : JSON.stringify(result, null, 2)} />
        </div>
      )}
    </div>
  );
}
