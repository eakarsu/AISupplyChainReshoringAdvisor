import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULT_PARAMS = {
  tariff_rate_pct: 25,
  fx_rate_usd: 1.0,
  port_availability_pct: 90,
  domestic_labor_premium_pct: 30,
};

function ScenarioBundles() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', parameters: { ...DEFAULT_PARAMS } });
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => { loadScenarios(); }, []);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/scenarios');
      setScenarios(res.data);
    } catch (err) {
      console.error('Failed to load scenarios:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await api.post('/ai/scenarios/create', form);
      setShowForm(false);
      setForm({ name: '', description: '', parameters: { ...DEFAULT_PARAMS } });
      loadScenarios();
    } catch (err) {
      alert('Failed to create scenario: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleRun = async (scenarioId) => {
    setRunningId(scenarioId);
    setSelectedResult(null);
    try {
      const res = await api.post(`/ai/scenarios/${scenarioId}/run`);
      setSelectedResult({ ...res.data, scenarioId });
      loadScenarios();
    } catch (err) {
      alert('Failed to run scenario: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunningId(null);
    }
  };

  const updateParam = (key, value) => {
    setForm(prev => ({ ...prev, parameters: { ...prev.parameters, [key]: parseFloat(value) || value } }));
  };

  const riskColor = (level) => {
    const map = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7f1d1d' };
    return map[level] || '#6b7280';
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Scenario Bundles</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0' }}>
            Create what-if scenarios and compare them against your baseline supply chain data.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          + New Scenario
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', background: '#F9FAFB' }}>
          <h3 style={{ margin: '0 0 1rem' }}>New Scenario</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. High Tariff Scenario"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this scenario..."
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <h4 style={{ margin: '0 0 0.75rem' }}>Parameters</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {Object.entries(form.parameters).map(([key, val]) => (
              <div key={key}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  {key.replace(/_/g, ' ').replace(/pct/, '%')}
                </label>
                <input
                  type="number"
                  value={val}
                  onChange={e => updateParam(key, e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleCreate}
              disabled={creating || !form.name.trim()}
              style={{ padding: '0.5rem 1.2rem', background: creating ? '#9CA3AF' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              {creating ? 'Creating...' : 'Create Scenario'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ padding: '0.5rem 1.2rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scenarios List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading scenarios...</div>
      ) : scenarios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          No scenarios yet. Create one to start what-if analysis.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scenarios.map(s => (
            <div key={s.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem' }}>{s.name}</h3>
                  {s.description && <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{s.description}</p>}
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    Status: <strong>{s.status}</strong> · Created: {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleRun(s.id)}
                    disabled={runningId === s.id}
                    style={{
                      padding: '0.4rem 1rem',
                      background: runningId === s.id ? '#9CA3AF' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: runningId === s.id ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {runningId === s.id ? 'Running...' : 'Run Analysis'}
                  </button>
                  {s.result_data && (
                    <button
                      onClick={() => setSelectedResult({ analysis: s.result_data, scenarioId: s.id })}
                      style={{ padding: '0.4rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>

              {/* Parameters preview */}
              {s.parameters && Object.keys(s.parameters).length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Object.entries(s.parameters).slice(0, 4).map(([k, v]) => (
                    <span key={k} style={{ background: '#EFF6FF', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {k.replace(/_/g, ' ')}: {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}
          onClick={() => setSelectedResult(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '700px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Scenario Analysis Results</h2>
              <button onClick={() => setSelectedResult(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {selectedResult.analysis && (
              <div>
                {selectedResult.analysis.risk_level && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      background: riskColor(selectedResult.analysis.risk_level),
                      color: 'white', padding: '0.3rem 0.75rem', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem'
                    }}>
                      Risk: {selectedResult.analysis.risk_level}
                    </span>
                  </div>
                )}

                {selectedResult.analysis.vs_baseline && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4>vs. Baseline</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {Object.entries(selectedResult.analysis.vs_baseline).map(([k, v]) => (
                        <div key={k} style={{ background: '#F3F4F6', borderRadius: '6px', padding: '0.5rem 1rem', textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, color: v > 0 ? '#ef4444' : '#10b981' }}>{v > 0 ? '+' : ''}{v}%</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{k.replace(/_/g, ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResult.analysis.estimated_annual_impact_usd && (
                  <p><strong>Estimated Annual Impact:</strong> ${selectedResult.analysis.estimated_annual_impact_usd?.toLocaleString()}</p>
                )}

                {selectedResult.analysis.key_findings?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4>Key Findings</h4>
                    <ul>{selectedResult.analysis.key_findings.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}

                {selectedResult.analysis.recommendations?.length > 0 && (
                  <div>
                    <h4>Recommendations</h4>
                    <ul>{selectedResult.analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioBundles;
