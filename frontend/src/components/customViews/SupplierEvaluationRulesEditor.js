import React, { useEffect, useState } from 'react';
import api from '../../services/api';

// NON-VIZ — CRUD editor for supplier evaluation rule weights + criteria
const EMPTY = { criterion: '', weight: 0.1, direction: 'higher_better', threshold: '', notes: '', enabled: true };

export default function SupplierEvaluationRulesEditor() {
  const [rules, setRules] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const res = await api.get('/custom-views/evaluation-rules');
      setRules(res.data.rules || []);
      setTotalWeight(res.data.total_weight || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (r) => { setEditingId(r.id); setForm({ ...r, threshold: r.threshold ?? '' }); };
  const reset = () => { setEditingId(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.criterion?.trim()) { setErr('criterion required'); return; }
    const body = { ...form, weight: Number(form.weight), threshold: form.threshold === '' ? null : Number(form.threshold) };
    try {
      if (editingId) {
        await api.put(`/custom-views/evaluation-rules/${editingId}`, body);
      } else {
        await api.post('/custom-views/evaluation-rules', body);
      }
      reset();
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await api.delete(`/custom-views/evaluation-rules/${id}`);
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Supplier Evaluation Rules</h3>
        <div style={{ fontSize: 12, color: totalWeight > 1.01 ? '#b91c1c' : '#16a34a' }}>
          Total weight (enabled): {totalWeight}
        </div>
      </div>

      {err && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{err}</div>}

      {loading ? <div>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={th}>Criterion</th>
              <th style={th}>Weight</th>
              <th style={th}>Direction</th>
              <th style={th}>Threshold</th>
              <th style={th}>Enabled</th>
              <th style={th}>Notes</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={td}><b>{r.criterion}</b></td>
                <td style={td}>{Number(r.weight).toFixed(2)}</td>
                <td style={td}>{r.direction}</td>
                <td style={td}>{r.threshold ?? '—'}</td>
                <td style={td}>{r.enabled ? 'yes' : 'no'}</td>
                <td style={{ ...td, color: '#475569', maxWidth: 240 }}>{r.notes}</td>
                <td style={td}>
                  <button onClick={() => startEdit(r)} style={btnSm('#3b82f6')}>Edit</button>{' '}
                  <button onClick={() => remove(r.id)} style={btnSm('#ef4444')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4 style={{ marginTop: 16, color: '#0f172a' }}>{editingId ? `Edit rule #${editingId}` : 'Add new rule'}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <input style={inp} placeholder="criterion (e.g. cycle_time)"
          value={form.criterion} onChange={e => setForm({ ...form, criterion: e.target.value })} />
        <input style={inp} type="number" step="0.01" placeholder="weight"
          value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
        <select style={inp} value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
          <option value="higher_better">higher_better</option>
          <option value="lower_better">lower_better</option>
        </select>
        <input style={inp} type="number" step="0.01" placeholder="threshold (optional)"
          value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1e293b' }}>
          <input type="checkbox" checked={!!form.enabled}
            onChange={e => setForm({ ...form, enabled: e.target.checked })} />
          enabled
        </label>
        <input style={inp} placeholder="notes"
          value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={save} style={btn('#10b981')}>{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button onClick={reset} style={btn('#64748b')}>Cancel</button>}
      </div>
    </div>
  );
}

const th = { padding: 6, textAlign: 'left', borderBottom: '2px solid #cbd5e1', fontSize: 12, color: '#475569' };
const td = { padding: 6 };
const inp = { padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit' };
const btn = (bg) => ({ padding: '8px 14px', borderRadius: 6, background: bg, color: '#fff', border: 0, cursor: 'pointer' });
const btnSm = (bg) => ({ padding: '4px 10px', borderRadius: 4, background: bg, color: '#fff', border: 0, cursor: 'pointer', fontSize: 12 });
