import React, { useState } from 'react';
import api from '../services/api';
import AiAnalysisDisplay from '../components/AiAnalysisDisplay';
import FullFieldPresets from '../components/FullFieldPresets';

const PRESETS = [
  {
    "label": "Reno electronics site",
    "values": {
      "siteName": "Reno electronics assembly site",
      "location": "Reno, Nevada",
      "notes": "Example greenfield electronics assembly site. Assess water, power, wildfire exposure, and logistics access."
    }
  },
  {
    "label": "Monterrey automotive site",
    "values": {
      "siteName": "Monterrey automotive components site",
      "location": "Monterrey, Nuevo León, Mexico",
      "notes": "Example supplier park location. Review water availability, labor capacity, border transit, and utility reliability."
    }
  },
  {
    "label": "Ontario battery site",
    "values": {
      "siteName": "Ontario battery materials site",
      "location": "Windsor, Ontario, Canada",
      "notes": "Example battery materials operation. Review power supply, permitting, workforce, and cross-border shipping."
    }
  }
];

export default function SiteRiskScore() {
  const [form, setForm] = useState({
    siteId: '',
    siteName: '',
    location: '',
    notes: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const payload = form.siteId
        ? { siteId: Number(form.siteId) }
        : { name: form.siteName, location: form.location, notes: form.notes };
      const res = await api.post('/ai/site-risk-score', payload);
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
          <h1>🛡️ Site Risk Scoring</h1>
          <p className="page-subtitle">Multi-factor risk score for a candidate reshoring site.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
        <FullFieldPresets value={form} presets={PRESETS} disabled={loading} description="Examples fill site details and preserve any selected site ID." onChange={(next) => { setForm(next); setResult(null); }} />
        <p className="ai-hint">An existing site ID stays selected. Clear it to score the example site details instead.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="form-group">
            <label>Existing Site ID (optional)</label>
            <input className="form-input" type="number" value={form.siteId} onChange={(e) => handleChange('siteId', e.target.value)} placeholder="e.g. 12" />
          </div>
          <div className="form-group">
            <label>Site Name</label>
            <input className="form-input" type="text" value={form.siteName} onChange={(e) => handleChange('siteName', e.target.value)} placeholder="e.g. Reno Plant" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="e.g. Reno, NV" />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 14 }}>
          <label>Notes / Context</label>
          <textarea className="ai-textarea" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} placeholder="Any extra context: industry, planned workforce, climate concerns..." />
        </div>
        <button type="submit" className="btn btn-ai-submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? '🔄 Scoring...' : '🚀 Score Risk'}
        </button>
      </form>

      {error && <div className="ai-result" style={{ borderColor: '#ef4444', color: '#b91c1c', padding: 12, marginBottom: 16 }}>{error}</div>}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <p>AI is assessing site risk...</p>
        </div>
      )}

      {result !== null && !loading && (
        <div className="ai-result">
          <div className="ai-result-header"><h3>Risk Score</h3></div>
          <AiAnalysisDisplay content={result} />
        </div>
      )}
    </div>
  );
}
