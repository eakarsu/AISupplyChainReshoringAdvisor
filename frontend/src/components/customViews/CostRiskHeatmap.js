import React, { useEffect, useState } from 'react';
import api from '../../services/api';

// VIZ — Country x Factor heatmap (cost + risk)
function cellColor(v, min = 0, max = 10) {
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  // green -> yellow -> red
  const r = Math.round(16 + (239 - 16) * t);
  const g = Math.round(185 - (185 - 68) * t);
  const b = Math.round(129 - (129 - 68) * t);
  return `rgb(${r},${g},${b})`;
}

export default function CostRiskHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const res = await api.post('/custom-views/cost-risk-heatmap', {});
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading heatmap…</div>;
  if (err)     return <div style={{ padding: 16, color: '#b91c1c' }}>Error: {err}</div>;
  if (!data)   return null;

  const { countries = [], factors = [], matrix = [] } = data;

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Cost + Risk Heatmap (Country x Factor)</h3>
        <button onClick={load} style={{ padding: '6px 12px', borderRadius: 6, background: '#8b5cf6', color: '#fff', border: 0, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: 6, textAlign: 'left', fontSize: 12, color: '#475569' }}>Country \ Factor</th>
              {factors.map(f => (
                <th key={f} style={{ padding: 6, fontSize: 12, color: '#475569', textAlign: 'center' }}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map((c, i) => (
              <tr key={c}>
                <td style={{ padding: 6, fontSize: 12, color: '#0f172a', fontWeight: 600 }}>{c}</td>
                {factors.map((f, j) => {
                  const v = matrix[i]?.[j] ?? 0;
                  return (
                    <td key={f} title={`${c} / ${f}: ${v}`}
                      style={{
                        padding: 0, textAlign: 'center', minWidth: 60, height: 40,
                        background: cellColor(v), color: '#fff', fontWeight: 700, fontSize: 13,
                        borderRadius: 4, border: '2px solid #fff',
                      }}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: 12, color: '#475569' }}>
        Low risk
        <div style={{ width: 200, height: 12, borderRadius: 6, background: 'linear-gradient(to right, rgb(16,185,129), rgb(245,158,11), rgb(239,68,68))' }} />
        High risk
      </div>
    </div>
  );
}
