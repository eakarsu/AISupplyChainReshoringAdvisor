import React, { useState } from 'react';
import api from '../services/api';
import AiAnalysisDisplay from '../components/AiAnalysisDisplay';
import FullFieldPresets from '../components/FullFieldPresets';

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

const TOOL_PRESETS = {
  chat: [
    ['Semiconductor sourcing', 'What risks and lead-time tradeoffs should a US electronics manufacturer assess before qualifying domestic semiconductor suppliers?'],
    ['Battery materials', 'Compare practical sourcing risks for Canadian and US battery materials, including permitting and supplier concentration.'],
    ['Medical device suppliers', 'What questions should a medical device company ask when moving precision component sourcing from Asia to Mexico?'],
  ],
  report: [
    ['Executive semiconductor review', 'Assess a hypothetical US semiconductor assembly reshoring plan: supplier qualification, workforce needs, capital costs, and three decisions for executives.'],
    ['Supplier evaluation', 'Compare two hypothetical PCB suppliers in Mexico and the United States on capacity, quality, logistics, and continuity risk.'],
    ['Workforce readiness', 'Outline workforce planning for a hypothetical battery module plant in Ontario, including hiring, training, and schedule assumptions.'],
  ],
  scenario: [
    ['Tariff increase', 'Simulate a 10 percentage point tariff increase on imported printed circuit boards and compare domestic assembly options.'],
    ['Port disruption', 'Simulate a four-week Pacific port disruption for an electronics manufacturer with limited safety stock.'],
    ['Labor shortage', 'Simulate a 15% skilled labor shortage during the first year of a new automotive components plant.'],
  ],
  market: [
    ['US electronics', 'Summarize US electronics manufacturing demand signals and identify evidence needed before an investment decision.'],
    ['Mexico automotive', 'Assess automotive component supplier capacity and workforce considerations in Nuevo León.'],
    ['Canada batteries', 'Outline battery manufacturing market signals in Ontario and list data that should be verified.'],
  ],
  risk: [
    ['Electronics supply chain', 'Review a hypothetical electronics supply chain with PCB sourcing in Mexico, chips from Taiwan, and final assembly in Arizona.'],
    ['Battery modules', 'Review a hypothetical Ontario battery module operation with cell imports from South Korea and one electrolyte source.'],
    ['Medical devices', 'Review a hypothetical US medical device assembler using precision molding in Mexico and one sterilization provider.'],
  ],
};

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

            <FullFieldPresets value={{ input, reportType }} presets={TOOL_PRESETS[activeTool].map(([label, value], index) => ({ label, values: { input: value, ...(activeTool === 'report' ? { reportType: [REPORT_TYPES[0], REPORT_TYPES[1], REPORT_TYPES[6]][index] } : {}) } }))} disabled={loading} onChange={(next) => { setInput(next.input); setReportType(next.reportType); setResult(null); }} />
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
            ) : result !== null ? (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>AI Response</h3>
                  <button className="btn btn-sm" onClick={() => navigator.clipboard.writeText(typeof result === 'string' ? result : JSON.stringify(result, null, 2))}>
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
