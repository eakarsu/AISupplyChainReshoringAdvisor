import React, { useState } from 'react';
import api from '../services/api';

function ReshoringDecision() {
  const [productSku, setProductSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!productSku.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/ai/reshoring-decision', { productSku, quantity: parseInt(quantity) || undefined });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;
  const scoreColor = (score) => score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Reshoring Decision Engine</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        AI-powered analysis comparing offshore vs. domestic production with 5-year ROI projection.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Product SKU *</label>
          <input
            value={productSku}
            onChange={e => setProductSku(e.target.value)}
            placeholder="e.g. PROD-001"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Annual Quantity</label>
          <input
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            type="number"
            placeholder="e.g. 10000"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleAnalyze}
            disabled={loading || !productSku.trim()}
            style={{
              padding: '0.5rem 1.5rem',
              background: loading ? '#9CA3AF' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {analysis && (
        <div>
          {/* Score Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Reshoring Score', value: analysis.reshoring_score, suffix: '/100', color: scoreColor(analysis.reshoring_score) },
              { label: 'Risk Score', value: analysis.risk_score, suffix: '/100', color: scoreColor(100 - analysis.risk_score) },
              { label: 'ROI Timeline', value: analysis.roi_months, suffix: ' months', color: '#3b82f6' },
              { label: '5-Year Savings', value: analysis.cost_savings_5yr ? `$${(analysis.cost_savings_5yr / 1e6).toFixed(1)}M` : 'N/A', suffix: '', color: '#10b981' },
            ].map(card => (
              <div key={card.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color }}>
                  {card.value ?? 'N/A'}{card.suffix && typeof card.value === 'number' ? card.suffix : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>Executive Summary</h3>
              <p style={{ margin: 0 }}>{analysis.summary}</p>
            </div>
          )}

          {/* Recommendation */}
          {analysis.recommendation && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Recommendation</h3>
              <p>{analysis.recommendation}</p>
            </div>
          )}

          {/* Cost Comparison */}
          {(analysis.total_landed_cost_offshore || analysis.total_landed_cost_domestic) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Cost Comparison (Annual)</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, background: '#FEF3C7', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#92400e' }}>Offshore Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e' }}>
                    ${(analysis.total_landed_cost_offshore || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#D1FAE5', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#065f46' }}>Domestic Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46' }}>
                    ${(analysis.total_landed_cost_domestic || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Migration Phases */}
          {analysis.migration_phases?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Migration Phases</h3>
              {analysis.migration_phases.map((phase, i) => (
                <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>Phase {phase.phase}: {phase.name}</h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                      <span>{phase.duration_months} months</span>
                      {phase.cost_estimate && <span>${phase.cost_estimate.toLocaleString()}</span>}
                    </div>
                  </div>
                  {phase.actions?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {phase.actions.map((a, j) => <li key={j} style={{ fontSize: '0.9rem' }}>{a}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Risks & Opportunities */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {analysis.top_risks?.length > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ color: '#991B1B', margin: '0 0 0.5rem' }}>Top Risks</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {analysis.top_risks.map((r, i) => <li key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{r}</li>)}
                </ul>
              </div>
            )}
            {analysis.key_opportunities?.length > 0 && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ color: '#166534', margin: '0 0 0.5rem' }}>Key Opportunities</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {analysis.key_opportunities.map((o, i) => <li key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{o}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReshoringDecision;
