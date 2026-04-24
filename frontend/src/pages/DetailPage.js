import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AiAnalysisDisplay from '../components/AiAnalysisDisplay';
import FormModal from '../components/FormModal';
import { getFieldConfig } from '../utils/fieldConfigs';

export default function DetailPage({ feature }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      const res = await api.get(`${feature.api}/${id}`);
      setItem(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [feature.api, id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`${feature.api}/${id}/analyze`);
      setItem(prev => ({ ...prev, ai_analysis: res.data.analysis }));
    } catch (e) {
      alert('Analysis failed: ' + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`${feature.api}/${id}`);
      navigate(`/${feature.key}`);
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleSave = async (data) => {
    try {
      await api.put(`${feature.api}/${id}`, data);
      setShowEdit(false);
      loadItem();
    } catch (e) {
      alert('Save failed');
    }
  };

  const fieldConfig = getFieldConfig(feature.key);

  if (loading) return <div className="page"><div className="loading-spinner">Loading...</div></div>;
  if (!item) return <div className="page"><div className="empty-state"><h3>Item not found</h3></div></div>;

  const excludeFields = ['id', 'created_at', 'ai_analysis'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="btn btn-back" onClick={() => navigate(`/${feature.key}`)}>← Back to {feature.label}</button>
          <h1>{feature.icon} {item[fieldConfig.titleField] || item.name || item.title || `Record #${item.id}`}</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? '🔄 Analyzing...' : '🤖 AI Analyze'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-delete" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Details</h3>
          <div className="detail-fields">
            {Object.entries(item)
              .filter(([key]) => !excludeFields.includes(key))
              .map(([key, value]) => (
                <div key={key} className="detail-field">
                  <label>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                  <div className="detail-value">
                    {typeof value === 'number' && key.includes('cost') || key.includes('budget') || key.includes('amount') || key.includes('spent') || key.includes('projected') || key.includes('variance') || key.includes('savings') || key.includes('value')
                      ? `$${Number(value).toLocaleString()}`
                      : key.includes('score') || key.includes('rating')
                      ? <span className="score-badge">{value}</span>
                      : key.includes('status')
                      ? <span className={`status-badge status-${String(value || '').toLowerCase().replace(/[^a-z]/g, '_')}`}>{value}</span>
                      : key.includes('rate') || key.includes('percentage') || key.includes('pct') || key.includes('reduction') || key.includes('growth') || key.includes('confidence') || key.includes('roi')
                      ? `${value}%`
                      : String(value || '—')
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="detail-card ai-card">
          <div className="ai-card-header">
            <h3>🤖 AI Analysis</h3>
            <button className="btn btn-sm btn-ai" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
          {item.ai_analysis ? (
            <AiAnalysisDisplay content={item.ai_analysis} />
          ) : (
            <div className="ai-empty">
              <p>No AI analysis yet. Click "AI Analyze" to generate insights.</p>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <FormModal
          feature={feature}
          item={item}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
          fieldConfig={fieldConfig}
        />
      )}
    </div>
  );
}
