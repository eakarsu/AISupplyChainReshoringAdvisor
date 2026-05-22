import React, { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { port: '', lane: '', chassisGap: 0, dwellHours: 0, borderImpact: '', mitigation: '', status: 'watch' };

export default function PortDrayageConstraint() {
  const [constraints, setConstraints] = useState([]);
  const [summary, setSummary] = useState({ total: 0, chassisGap: 0, watch: 0 });
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const res = await api.get('/port-drayage-constraint');
    setConstraints(res.data.constraints || []);
    setSummary(res.data.summary || { total: 0, chassisGap: 0, watch: 0 });
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/port-drayage-constraint', form);
    setForm(emptyForm);
    load();
  };

  return (
    <div className="page">
      <h1>Port Drayage Constraint</h1>
      <p>Reshoring site scenarios with port dwell, chassis gaps, and cross-border lane constraints.</p>
      <div className="stats-grid">
        {['total', 'chassisGap', 'watch'].map(key => <div className="stat-card" key={key}><span>{key}</span><strong>{summary[key]}</strong></div>)}
      </div>
      <form className="card" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {['port', 'lane', 'borderImpact', 'mitigation'].map(field => <input key={field} placeholder={field} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />)}
        <input type="number" value={form.chassisGap} onChange={e => setForm({ ...form, chassisGap: e.target.value })} />
        <input type="number" value={form.dwellHours} onChange={e => setForm({ ...form, dwellHours: e.target.value })} />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>watch</option><option>clear</option><option>blocked</option></select>
        <button type="submit">Add Constraint</button>
      </form>
      <table className="data-table">
        <thead><tr>{['Port', 'Lane', 'Chassis Gap', 'Dwell', 'Border Impact', 'Mitigation', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{constraints.map(row => <tr key={row.id}><td>{row.port}</td><td>{row.lane}</td><td>{row.chassisGap}</td><td>{row.dwellHours}h</td><td>{row.borderImpact}</td><td>{row.mitigation}</td><td>{row.status}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
