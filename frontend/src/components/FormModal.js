import React, { useState } from 'react';

export default function FormModal({ feature, item, onSave, onClose, fieldConfig }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const data = { ...item };
      delete data.id;
      delete data.created_at;
      delete data.ai_analysis;
      return data;
    }
    const defaults = {};
    fieldConfig.formFields.forEach(f => {
      defaults[f.key] = f.default || '';
    });
    return defaults;
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit' : 'New'} {feature.label}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {fieldConfig.formFields.map(f => (
              <div key={f.key} className="form-group">
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    rows={3}
                    required={f.required}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    required={f.required}
                  >
                    <option value="">Select...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    required={f.required}
                    step={f.type === 'number' ? 'any' : undefined}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
