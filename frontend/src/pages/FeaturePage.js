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
                <tr key={item.id} onClick={() => navigate(`/${feature.key}/${item.id}`)} className="clickable-row">
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
