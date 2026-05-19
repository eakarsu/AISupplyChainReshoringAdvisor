import React, { useState } from 'react';
import api from '../../services/api';

// NON-VIZ — request the analysis PDF and offer download/preview
export default function ReshoringAnalysisPdf() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [err, setErr] = useState('');
  const [summary, setSummary] = useState('');

  const fetchPdf = async () => {
    setLoading(true); setErr('');
    try {
      const res = await api.post('/custom-views/analysis-pdf', { summary }, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `reshoring-analysis-${Date.now()}.pdf`;
    a.click();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ margin: '0 0 12px', color: '#0f172a' }}>Reshoring Analysis PDF</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#475569' }}>Custom Executive Summary (optional)</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="Override the default executive summary…"
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={fetchPdf} disabled={loading}
          style={{ padding: '8px 14px', borderRadius: 6, background: '#10b981', color: '#fff', border: 0, cursor: 'pointer' }}>
          {loading ? 'Generating…' : 'Generate PDF'}
        </button>
        <button onClick={download} disabled={!previewUrl}
          style={{ padding: '8px 14px', borderRadius: 6, background: '#1e293b', color: '#fff', border: 0, cursor: previewUrl ? 'pointer' : 'not-allowed', opacity: previewUrl ? 1 : 0.5 }}>
          Download
        </button>
      </div>

      {err && <div style={{ color: '#b91c1c', marginTop: 8 }}>{err}</div>}

      {previewUrl && (
        <iframe title="reshoring-analysis-pdf" src={previewUrl}
          style={{ width: '100%', height: 400, marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 6 }} />
      )}
    </div>
  );
}
