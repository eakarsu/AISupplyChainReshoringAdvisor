import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AiCenter from './pages/AiCenter';
import DetailPage from './pages/DetailPage';
import ReshoringDecision from './pages/ReshoringDecision';
import ScenarioBundles from './pages/ScenarioBundles';
import GeographicRisk from './pages/GeographicRisk';
import LaborCostForecast from './pages/LaborCostForecast';
import SiteRiskScore from './pages/SiteRiskScore';
import TariffImpactForecast from './pages/TariffImpactForecast';
import SupplyChainResilienceScore from './pages/SupplyChainResilienceScore';
import CustomViewsPage from './pages/CustomViewsPage';
import PortDrayageConstraint from './pages/PortDrayageConstraint';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// === Batch 08 Gaps & Frontend Mounts ===
import CfLaborArbitrageModelingComparingWageProductivityTraining from './pages/CfLaborArbitrageModelingComparingWageProductivityTraining'
import CfSupplyChainResilienceScoringQuantifyingSingleSourcing from './pages/CfSupplyChainResilienceScoringQuantifyingSingleSourcing'
import CfRegulatoryComplexityAssessmentFlaggingEsgFtaReporting from './pages/CfRegulatoryComplexityAssessmentFlaggingEsgFtaReporting'
import CfBuildVsPartnerOptimizationComparingCapexOpex from './pages/CfBuildVsPartnerOptimizationComparingCapexOpex'
import CfMonteCarloScenarioPlanningForTariffLabor from './pages/CfMonteCarloScenarioPlanningForTariffLabor'
import CfNearshoringSpecificRecommendationEngineForMexicoCanada from './pages/CfNearshoringSpecificRecommendationEngineForMexicoCanada'
import GapAiEndpointsUnderEnumeratedShouldExposeLabor from './pages/GapAiEndpointsUnderEnumeratedShouldExposeLabor'
import GapNoScenarioComparisonEndpoint from './pages/GapNoScenarioComparisonEndpoint'
import GapNoConversationalReshoringAdvisorChat from './pages/GapNoConversationalReshoringAdvisorChat'
import GapNoIntegrationsWithPublicDataApisBls from './pages/GapNoIntegrationsWithPublicDataApisBls'
import GapNoScenarioModelingComparisonUiRoute from './pages/GapNoScenarioModelingComparisonUiRoute'
import GapNoFeasibilityScoringDecisionTree from './pages/GapNoFeasibilityScoringDecisionTree'
import GapNoProjectManagementForReshoringInitiatives from './pages/GapNoProjectManagementForReshoringInitiatives'
import GapNoWebhooksOrExternalNotifications from './pages/GapNoWebhooksOrExternalNotifications'
import GapNoMultiTenantClientWorkspaceSeparation from './pages/GapNoMultiTenantClientWorkspaceSeparation'

const FEATURES = [
  { key: 'suppliers', label: 'Supplier Discovery', icon: '🏭', api: '/suppliers', color: '#3b82f6' },
  { key: 'risk-assessments', label: 'Risk Assessment', icon: '⚠️', api: '/risk-assessments', color: '#ef4444' },
  { key: 'cost-analysis', label: 'Cost Analysis', icon: '💰', api: '/cost-analysis', color: '#10b981' },
  { key: 'tariff-calculations', label: 'Tariff Calculator', icon: '📊', api: '/tariff-calculations', color: '#f59e0b' },
  { key: 'supply-chain-maps', label: 'Supply Chain Mapping', icon: '🗺️', api: '/supply-chain-maps', color: '#8b5cf6' },
  { key: 'compliance-checks', label: 'Compliance Checker', icon: '✅', api: '/compliance-checks', color: '#06b6d4' },
  { key: 'transport-routes', label: 'Route Optimizer', icon: '🚛', api: '/transport-routes', color: '#ec4899' },
  { key: 'workforce-plans', label: 'Workforce Planning', icon: '👷', api: '/workforce-plans', color: '#f97316' },
  { key: 'site-selections', label: 'Site Selection', icon: '📍', api: '/site-selections', color: '#14b8a6' },
  { key: 'inventory', label: 'Inventory Optimization', icon: '📦', api: '/inventory', color: '#6366f1' },
  { key: 'demand-forecasts', label: 'Demand Forecasting', icon: '📈', api: '/demand-forecasts', color: '#84cc16' },
  { key: 'quality-assessments', label: 'Quality Assessment', icon: '🔍', api: '/quality-assessments', color: '#a855f7' },
  { key: 'environmental-impacts', label: 'Environmental Impact', icon: '🌿', api: '/environmental-impacts', color: '#22c55e' },
  { key: 'trade-agreements', label: 'Trade Agreements', icon: '🤝', api: '/trade-agreements', color: '#0ea5e9' },
  { key: 'budget-plans', label: 'Budget Planning', icon: '💵', api: '/budget-plans', color: '#eab308' },
];

export { FEATURES };

// Local pass-through guard — token presence is already enforced at /* level in <App/>
function ProtectedRoute({ children }) {
  return children;
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(`/${path}`);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/dashboard')}>
            {!sidebarCollapsed && <h2>🔗 Reshoring AI</h2>}
            {sidebarCollapsed && <span className="logo-icon">🔗</span>}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">{!sidebarCollapsed && 'Dashboard'}</div>
            <button
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <span className="nav-icon">📊</span>
              {!sidebarCollapsed && <span>Overview</span>}
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">{!sidebarCollapsed && 'Features'}</div>
            {FEATURES.map(f => (
              <button
                key={f.key}
                className={`nav-item ${isActive(f.key) ? 'active' : ''}`}
                onClick={() => navigate(`/${f.key}`)}
              >
                <span className="nav-icon">{f.icon}</span>
                {!sidebarCollapsed && <span>{f.label}</span>}
              </button>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">{!sidebarCollapsed && 'AI Center'}</div>
            <button
              className={`nav-item ai-center-btn ${isActive('ai-center') ? 'active' : ''}`}
              onClick={() => navigate('/ai-center')}
            >
              <span className="nav-icon">🤖</span>
              {!sidebarCollapsed && <span>AI Command Center</span>}
            </button>
            <button
              className={`nav-item ${isActive('reshoring-decision') ? 'active' : ''}`}
              onClick={() => navigate('/reshoring-decision')}
            >
              <span className="nav-icon">🏭</span>
              {!sidebarCollapsed && <span>Reshoring Decision</span>}
            </button>
            <button
              className={`nav-item ${isActive('scenario-bundles') ? 'active' : ''}`}
              onClick={() => navigate('/scenario-bundles')}
            >
              <span className="nav-icon">🎯</span>
              {!sidebarCollapsed && <span>Scenario Bundles</span>}
            </button>
            <button
              className={`nav-item ${isActive('geographic-risk') ? 'active' : ''}`}
              onClick={() => navigate('/geographic-risk')}
            >
              <span className="nav-icon">🗺️</span>
              {!sidebarCollapsed && <span>Geographic Risk</span>}
            </button>
            <button
              className={`nav-item ${isActive('labor-cost-forecast') ? 'active' : ''}`}
              onClick={() => navigate('/labor-cost-forecast')}
            >
              <span className="nav-icon">💼</span>
              {!sidebarCollapsed && <span>Labor Cost Forecast</span>}
            </button>
            <button
              className={`nav-item ${isActive('site-risk-score') ? 'active' : ''}`}
              onClick={() => navigate('/site-risk-score')}
            >
              <span className="nav-icon">🛡️</span>
              {!sidebarCollapsed && <span>Site Risk Score</span>}
            </button>
            <button
              className={`nav-item ${isActive('tariff-impact-forecast') ? 'active' : ''}`}
              onClick={() => navigate('/tariff-impact-forecast')}
            >
              <span className="nav-icon">🛃</span>
              {!sidebarCollapsed && <span>Tariff Impact</span>}
            </button>
            <button
              className={`nav-item ${isActive('supply-chain-resilience-score') ? 'active' : ''}`}
              onClick={() => navigate('/supply-chain-resilience-score')}
            >
              <span className="nav-icon">🧱</span>
              {!sidebarCollapsed && <span>Resilience Score</span>}
            </button>
            <button
              data-testid="nav-custom-views"
              className={`nav-item ${isActive('custom-views') ? 'active' : ''}`}
              onClick={() => navigate('/custom-views')}
            >
              <span className="nav-icon">📐</span>
              {!sidebarCollapsed && <span>Reshoring Views</span>}
            </button>
            <button
              className={`nav-item ${isActive('port-drayage-constraint') ? 'active' : ''}`}
              onClick={() => navigate('/port-drayage-constraint')}
            >
              <span className="nav-icon">🚚</span>
              {!sidebarCollapsed && <span>Port Drayage</span>}
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          {user && !sidebarCollapsed && (
            <div className="user-info">
              <div className="user-avatar">{user.name?.[0] || 'A'}</div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            {sidebarCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

          <Route path="/dashboard" element={<Dashboard />} />
          {FEATURES.map(f => (
            <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} />} />
          ))}
          {FEATURES.map(f => (
            <Route key={`${f.key}-detail`} path={`/${f.key}/:id`} element={<DetailPage feature={f} />} />
          ))}
          <Route path="/ai-center" element={<AiCenter />} />
          <Route path="/reshoring-decision" element={<ReshoringDecision />} />
          <Route path="/scenario-bundles" element={<ScenarioBundles />} />
          <Route path="/geographic-risk" element={<GeographicRisk />} />
          <Route path="/labor-cost-forecast" element={<LaborCostForecast />} />
          <Route path="/site-risk-score" element={<SiteRiskScore />} />
          <Route path="/tariff-impact-forecast" element={<TariffImpactForecast />} />
          <Route path="/supply-chain-resilience-score" element={<SupplyChainResilienceScore />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          <Route path="/port-drayage-constraint" element={<PortDrayageConstraint />} />
          {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-labor-arbitrage-modeling-comparing-wage-productivity-training-costs" element={<ProtectedRoute><CfLaborArbitrageModelingComparingWageProductivityTraining /></ProtectedRoute>} />
      <Route path="/cf-supply-chain-resilience-scoring-quantifying-single-sourcing-and-geopolitical" element={<ProtectedRoute><CfSupplyChainResilienceScoringQuantifyingSingleSourcing /></ProtectedRoute>} />
      <Route path="/cf-regulatory-complexity-assessment-flagging-esg-fta-reporting-burden" element={<ProtectedRoute><CfRegulatoryComplexityAssessmentFlaggingEsgFtaReporting /></ProtectedRoute>} />
      <Route path="/cf-build-vs-partner-optimization-comparing-capex-opex-vs-continued-outsourcing" element={<ProtectedRoute><CfBuildVsPartnerOptimizationComparingCapexOpex /></ProtectedRoute>} />
      <Route path="/cf-monte-carlo-scenario-planning-for-tariff-labor-currency" element={<ProtectedRoute><CfMonteCarloScenarioPlanningForTariffLabor /></ProtectedRoute>} />
      <Route path="/cf-nearshoring-specific-recommendation-engine-for-mexico-canada" element={<ProtectedRoute><CfNearshoringSpecificRecommendationEngineForMexicoCanada /></ProtectedRoute>} />
      <Route path="/gap-ai-endpoints-under-enumerated-should-expose-labor-cost-prediction" element={<ProtectedRoute><GapAiEndpointsUnderEnumeratedShouldExposeLabor /></ProtectedRoute>} />
      <Route path="/gap-no-scenario-comparison-endpoint" element={<ProtectedRoute><GapNoScenarioComparisonEndpoint /></ProtectedRoute>} />
      <Route path="/gap-no-conversational-reshoring-advisor-chat" element={<ProtectedRoute><GapNoConversationalReshoringAdvisorChat /></ProtectedRoute>} />
      <Route path="/gap-no-integrations-with-public-data-apis-bls-un" element={<ProtectedRoute><GapNoIntegrationsWithPublicDataApisBls /></ProtectedRoute>} />
      <Route path="/gap-no-scenario-modeling-comparison-ui-route" element={<ProtectedRoute><GapNoScenarioModelingComparisonUiRoute /></ProtectedRoute>} />
      <Route path="/gap-no-feasibility-scoring-decision-tree" element={<ProtectedRoute><GapNoFeasibilityScoringDecisionTree /></ProtectedRoute>} />
      <Route path="/gap-no-project-management-for-reshoring-initiatives" element={<ProtectedRoute><GapNoProjectManagementForReshoringInitiatives /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks-or-external-notifications" element={<ProtectedRoute><GapNoWebhooksOrExternalNotifications /></ProtectedRoute>} />
      <Route path="/gap-no-multi-tenant-client-workspace-separation" element={<ProtectedRoute><GapNoMultiTenantClientWorkspaceSeparation /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> :
          <Login onLogin={() => setIsAuthenticated(true)} />
        } />
        <Route path="/*" element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;
