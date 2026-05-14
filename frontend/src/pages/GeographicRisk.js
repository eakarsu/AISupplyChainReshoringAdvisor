import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Risk level colors
const getRiskColor = (score) => {
  if (!score) return '#9ca3af';
  if (score >= 7) return '#ef4444';
  if (score >= 5) return '#f59e0b';
  if (score >= 3) return '#10b981';
  return '#3b82f6';
};

const getRiskLabel = (score) => {
  if (!score) return 'Unknown';
  if (score >= 7) return 'High';
  if (score >= 5) return 'Medium';
  if (score >= 3) return 'Low';
  return 'Minimal';
};

function GeographicRisk() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('risk_score');

  useEffect(() => { loadHeatmap(); }, []);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/suppliers/heatmap');
      setHeatmapData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group by country
  const byCountry = heatmapData.reduce((acc, s) => {
    const c = s.country || 'Unknown';
    if (!acc[c]) acc[c] = { country: c, suppliers: [], maxRisk: 0, avgReliability: 0 };
    acc[c].suppliers.push(s);
    acc[c].maxRisk = Math.max(acc[c].maxRisk, parseFloat(s.risk_score) || 0);
    return acc;
  }, {});

  const countries = Object.values(byCountry).map(c => ({
    ...c,
    avgReliability: c.suppliers.reduce((sum, s) => sum + (parseFloat(s.reliability_score) || 0), 0) / c.suppliers.length,
  }));

  const filtered = countries
    .filter(c => {
      if (filter === 'high') return c.maxRisk >= 7;
      if (filter === 'medium') return c.maxRisk >= 5 && c.maxRisk < 7;
      if (filter === 'low') return c.maxRisk < 5;
      return true;
    })
    .filter(c => !search || c.country.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'risk_score') return b.maxRisk - a.maxRisk;
      if (sortBy === 'supplier_count') return b.suppliers.length - a.suppliers.length;
      if (sortBy === 'reliability') return b.avgReliability - a.avgReliability;
      return a.country.localeCompare(b.country);
    });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading geographic risk data...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Geographic Risk Map</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Supplier risk concentration by country. {heatmapData.length} suppliers across {countries.length} countries.
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Suppliers', value: heatmapData.length, color: '#3b82f6' },
          { label: 'Countries', value: countries.length, color: '#8b5cf6' },
          { label: 'High Risk Countries', value: countries.filter(c => c.maxRisk >= 7).length, color: '#ef4444' },
          { label: 'Safe Countries', value: countries.filter(c => c.maxRisk < 3).length, color: '#10b981' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search country..."
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '180px' }}
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
        >
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
        >
          <option value="risk_score">Sort by Risk</option>
          <option value="supplier_count">Sort by Suppliers</option>
          <option value="reliability">Sort by Reliability</option>
          <option value="country">Sort by Country</option>
        </select>
      </div>

      {/* Visual Risk Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {filtered.map(country => (
          <div
            key={country.country}
            style={{
              border: `2px solid ${getRiskColor(country.maxRisk)}`,
              borderRadius: '8px',
              padding: '1rem',
              background: 'white',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: getRiskColor(country.maxRisk),
              color: 'white',
              padding: '0.15rem 0.5rem',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              {getRiskLabel(country.maxRisk)}
            </div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{country.country}</h4>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <div>{country.suppliers.length} supplier{country.suppliers.length !== 1 ? 's' : ''}</div>
              <div>Risk: {country.maxRisk.toFixed(1)}/10</div>
              {country.avgReliability > 0 && (
                <div>Reliability: {country.avgReliability.toFixed(1)}/10</div>
              )}
            </div>
            {/* Risk bar */}
            <div style={{ marginTop: '0.5rem', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width: `${(country.maxRisk / 10) * 100}%`,
                background: getRiskColor(country.maxRisk),
                borderRadius: '2px',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <h3>Supplier Details by Country</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>Supplier</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>Country</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>Region</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>Risk Score</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>Reliability</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData
              .filter(s => !search || s.country?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))
              .sort((a, b) => (parseFloat(b.risk_score) || 0) - (parseFloat(a.risk_score) || 0))
              .map((s, i) => (
                <tr key={s.id} style={{ background: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
                  <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb' }}>{s.country}</td>
                  <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', color: '#6b7280' }}>{s.region || '-'}</td>
                  <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{
                      background: getRiskColor(parseFloat(s.risk_score)),
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}>
                      {parseFloat(s.risk_score)?.toFixed(1) || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {s.reliability_score ? `${parseFloat(s.reliability_score).toFixed(1)}/10` : '-'}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {s.assessment_count > 0
                      ? <span style={{ color: '#10b981', fontWeight: 600 }}>Assessed</span>
                      : <span style={{ color: '#f59e0b' }}>Pending</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GeographicRisk;
