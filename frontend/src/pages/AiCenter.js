import React, { useState } from 'react';
import api from '../services/api';
import AiAnalysisDisplay from '../components/AiAnalysisDisplay';

const AI_TOOLS = [
  { key: 'chat', label: 'AI Chat Assistant', icon: '💬', description: 'Ask any supply chain reshoring question', endpoint: '/ai-center/chat', field: 'message', responseKey: 'response' },
  { key: 'report', label: 'Report Generator', icon: '📝', description: 'Generate comprehensive reshoring reports', endpoint: '/ai-center/generate-report', responseKey: 'report' },
  { key: 'scenario', label: 'Scenario Simulator', icon: '🎯', description: 'Simulate what-if reshoring scenarios', endpoint: '/ai-center/simulate-scenario', field: 'scenario', responseKey: 'simulation' },
  { key: 'market', label: 'Market Intelligence', icon: '📡', description: 'Get AI-powered market insights', endpoint: '/ai-center/market-intelligence', field: 'query', responseKey: 'intelligence' },
  { key: 'risk', label: 'Risk Monitor', icon: '🛡️', description: 'Real-time supply chain risk scanning', endpoint: '/ai-center/risk-monitor', field: 'context', responseKey: 'riskReport' },
];

const REPORT_TYPES = [
  'Executive Reshoring Summary',
  'Supplier Evaluation Report',
  'Cost-Benefit Analysis',
  'Risk Assessment Report',
  'Compliance Status Report',
  'Environmental Impact Report',
  'Workforce Readiness Report',
  'Market Intelligence Brief',
];

export default function AiCenter() {
  const [activeTool, setActiveTool] = useState('chat');
  const [input, setInput] = useState('');
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    const tool = AI_TOOLS.find(t => t.key === activeTool);

    try {
      let body;
      if (activeTool === 'report') {
        body = { reportType, parameters: { details: input } };
      } else {
        body = { [tool.field]: input };
      }

      const res = await api.post(tool.endpoint, body);
      const responseText = res.data[tool.responseKey];
      setResult(responseText);
      setHistory(prev => [{ tool: tool.label, input: input.substring(0, 100), timestamp: new Date().toISOString() }, ...prev.slice(0, 19)]);
    } catch (e) {
      setResult('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (activeTool) {
      case 'chat': return 'Ask about reshoring strategies, supply chain risks, cost analysis...';
      case 'report': return 'Describe what the report should cover...';
      case 'scenario': return 'Describe a what-if scenario (e.g., "What if China tariffs increase to 50%?")...';
      case 'market': return 'What market intelligence do you need? (e.g., "EV battery manufacturing trends")...';
      case 'risk': return 'Describe your supply chain context for risk analysis...';
      default: return 'Enter your query...';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🤖 AI Command Center</h1>
          <p className="page-subtitle">Comprehensive AI-powered supply chain intelligence</p>
        </div>
      </div>

      <div className="ai-center-layout">
        <div className="ai-tools-sidebar">
          {AI_TOOLS.map(tool => (
            <button
              key={tool.key}
              className={`ai-tool-card ${activeTool === tool.key ? 'active' : ''}`}
              onClick={() => { setActiveTool(tool.key); setResult(null); }}
            >
              <div className="ai-tool-icon">{tool.icon}</div>
              <div className="ai-tool-info">
                <div className="ai-tool-name">{tool.label}</div>
                <div className="ai-tool-desc">{tool.description}</div>
              </div>
            </button>
          ))}

          {history.length > 0 && (
            <div className="ai-history">
              <h4>Recent Queries</h4>
              {history.map((h, i) => (
                <div key={i} className="ai-history-item">
                  <span className="ai-history-tool">{h.tool}</span>
                  <span className="ai-history-input">{h.input}...</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ai-workspace">
          <div className="ai-input-section">
            <div className="ai-input-header">
              <h3>{AI_TOOLS.find(t => t.key === activeTool)?.icon} {AI_TOOLS.find(t => t.key === activeTool)?.label}</h3>
            </div>

            {activeTool === 'report' && (
              <div className="form-group">
                <label>Report Type</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)} className="form-select">
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            <div className="ai-input-area">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={getPlaceholder()}
                rows={4}
                className="ai-textarea"
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
              />
              <button className="btn btn-ai-submit" onClick={handleSubmit} disabled={loading || !input.trim()}>
                {loading ? '🔄 Processing...' : '🚀 Submit'}
              </button>
              <span className="ai-hint">Ctrl+Enter to submit</span>
            </div>
          </div>

          <div className="ai-result-section">
            {loading ? (
              <div className="ai-loading">
                <div className="ai-loading-spinner" />
                <p>AI is analyzing your request...</p>
              </div>
            ) : result ? (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>AI Response</h3>
                  <button className="btn btn-sm" onClick={() => navigator.clipboard.writeText(result)}>
                    Copy
                  </button>
                </div>
                <AiAnalysisDisplay content={result} />
              </div>
            ) : (
              <div className="ai-empty-state">
                <div className="ai-empty-icon">🤖</div>
                <h3>Ready to assist</h3>
                <p>Enter your query and click Submit to get AI-powered insights</p>
                <div className="ai-suggestions">
                  <h4>Try asking:</h4>
                  <button onClick={() => setInput('What are the top 5 risks of reshoring semiconductor manufacturing to the US?')}>
                    Top risks of semiconductor reshoring
                  </button>
                  <button onClick={() => setInput('Compare the costs of manufacturing EV batteries in China vs the United States')}>
                    EV battery manufacturing cost comparison
                  </button>
                  <button onClick={() => setInput('What trade agreements benefit reshoring to the US from Asia?')}>
                    Trade agreements for reshoring from Asia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
