import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormModal from '../components/FormModal';
import { getFieldConfig } from '../utils/fieldConfigs';

export default function FeaturePage({ feature }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(feature.api);
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [feature.api]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${feature.api}/${id}`);
      loadItems();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await api.put(`${feature.api}/${editItem.id}`, data);
      } else {
        await api.post(feature.api, data);
      }
      setShowModal(false);
      setEditItem(null);
      loadItems();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  const fieldConfig = getFieldConfig(feature.key);
  const displayFields = fieldConfig.tableFields;

  const filteredItems = items.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{feature.icon} {feature.label}</h1>
          <p className="page-subtitle">{filteredItems.length} records found</p>
        </div>
        <div className="page-actions">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="btn btn-primary"
            onClick={() => { setEditItem(null); setShowModal(true); }}
          >
            + New Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{feature.icon}</div>
          <h3>No records found</h3>
          <p>Click "New Item" to create your first record</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {displayFields.map(f => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)} className="clickable-row">
                  {displayFields.map(f => (
                    <td key={f.key}>
                      {f.render ? f.render(item[f.key], item) : (
                        f.type === 'currency' ? `$${Number(item[f.key] || 0).toLocaleString()}` :
                        f.type === 'score' ? <span className="score-badge">{item[f.key]}/10</span> :
                        f.type === 'status' ? <span className={`status-badge status-${(item[f.key] || '').toLowerCase().replace(/[^a-z]/g, '_')}`}>{item[f.key]}</span> :
                        f.type === 'percentage' ? `${item[f.key]}%` :
                        String(item[f.key] || '—').substring(0, 60)
                      )}
                    </td>
                  ))}
                  <td className="actions-cell" onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={(e) => { e.stopPropagation(); setEditItem(item); setShowModal(true); }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={(e) => handleDelete(item.id, e)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedItem(null)}>
          <div className="modal-content" role="dialog" aria-modal="true" style={{ background: "#1e293b", color: "#f8fafc", borderRadius: 14, padding: 24, width: "min(640px, 92vw)", maxHeight: "85vh", overflow: "auto", border: "1px solid #334155" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>{feature.icon} {selectedItem[fieldConfig.titleField] || selectedItem.name || selectedItem.title || `Record #${selectedItem.id}`}</h2>
              <button type="button" className="btn btn-sm" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <div className="detail-fields" style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              {Object.entries(selectedItem).filter(([k]) => !["id", "created_at", "ai_analysis"].includes(k)).map(([k, v]) => (
                <div key={k} className="detail-field" style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <label style={{ color: "#94a3b8", fontSize: 13 }}>{k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</label>
                  <div className="detail-value" style={{ fontSize: 14 }}>{String(v ?? "—")}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn btn-primary" onClick={() => { setEditItem(selectedItem); setSelectedItem(null); setShowModal(true); }}>Edit</button>
              <button type="button" className="btn btn-delete" onClick={(e) => { const id = selectedItem.id; setSelectedItem(null); handleDelete(id, e); }}>Delete</button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <FormModal
          feature={feature}
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          fieldConfig={fieldConfig}
        />
      )}
    </div>
  );
}
