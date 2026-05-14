import React, { useState } from 'react';
import api from '../services/api';
import AiAnalysisDisplay from '../components/AiAnalysisDisplay';

export default function SupplyChainResilienceScore() {
  const [form, setForm] = useState({
    supply_chain: '',
    suppliers: '',
    single_points_of_failure: '',
    geographies: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const tryParse = (s) => {
    if (!s || !s.trim()) return undefined;
    try { return JSON.parse(s); } catch { return s; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const payload = {
        supply_chain: tryParse(form.supply_chain),
        suppliers: tryParse(form.suppliers),
        single_points_of_failure: tryParse(form.single_points_of_failure),
        geographies: tryParse(form.geographies),
      };
      const res = await api.post('/ai/supply-chain-resilience-score', payload);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🛡️ Supply Chain Resilience Score</h1>
          <p className="page-subtitle">AI-scored end-to-end supply chain resilience with prioritized actions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          <div className="form-group">
            <label>Supply Chain (JSON or text) *</label>
            <textarea className="form-input" rows={4} value={form.supply_chain} onChange={(e) => handleChange('supply_chain', e.target.value)} placeholder='e.g. {"product":"PCBs","tiers":3}' />
          </div>
          <div className="form-group">
            <label>Suppliers (JSON array)</label>
            <textarea className="form-input" rows={3} value={form.suppliers} onChange={(e) => handleChange('suppliers', e.target.value)} placeholder='[{"name":"Acme","country":"VN","share_pct":40}]' />
          </div>
          <div className="form-group">
            <label>Single Points of Failure (JSON array)</label>
            <textarea className="form-input" rows={2} value={form.single_points_of_failure} onChange={(e) => handleChange('single_points_of_failure', e.target.value)} placeholder='["Sole supplier of substrate"]' />
          </div>
          <div className="form-group">
            <label>Geographies (JSON array)</label>
            <textarea className="form-input" rows={2} value={form.geographies} onChange={(e) => handleChange('geographies', e.target.value)} placeholder='["VN","TH","MX"]' />
          </div>
        </div>
        <button type="submit" className="btn btn-ai-submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? '🔄 Scoring...' : '🚀 Score Resilience'}
        </button>
      </form>

      {error && <div className="ai-result" style={{ borderColor: '#ef4444', color: '#b91c1c', padding: 12, marginBottom: 16 }}>{error}</div>}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <p>AI is scoring resilience...</p>
        </div>
      )}

      {result && !loading && (
        <div className="ai-result">
          <div className="ai-result-header"><h3>Resilience Score</h3></div>
          <AiAnalysisDisplay content={typeof result === 'string' ? result : JSON.stringify(result, null, 2)} />
        </div>
      )}
    </div>
  );
}
