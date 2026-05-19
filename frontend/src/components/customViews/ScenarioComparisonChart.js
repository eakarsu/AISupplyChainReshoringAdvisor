import React, { useEffect, useState } from 'react';
import api from '../../services/api';

// VIZ — bar chart for reshoring scenario comparison (cost + risk + lead time)
export default function ScenarioComparisonChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.post('/custom-views/scenario-comparison', {});
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading scenario comparison…</div>;
  if (err)     return <div style={{ padding: 16, color: '#b91c1c' }}>Error: {err}</div>;
  if (!data)   return null;

  const { labels = [], series = [] } = data;
  const maxVal = Math.max(1, ...series.flatMap(s => s.data || []));
  const chartH = 220;

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Reshoring Scenario Comparison</h3>
        <button onClick={load} style={{ padding: '6px 12px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 0, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: chartH, padding: '8px 8px 0 8px', borderBottom: '1px solid #e2e8f0' }}>
        {labels.map((lbl, i) => (
          <div key={lbl} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: chartH - 30 }}>
              {series.map(s => {
                const v = Number(s.data?.[i] || 0);
                const h = Math.max(2, (v / maxVal) * (chartH - 40));
                return (
                  <div key={s.key} title={`${s.label}: ${v}`}
                    style={{ width: 18, height: h, background: s.color, borderRadius: '4px 4px 0 0' }} />
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', maxWidth: 90, wordBreak: 'break-word' }}>{lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {series.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1e293b' }}>
            <span style={{ width: 12, height: 12, background: s.color, borderRadius: 2 }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
