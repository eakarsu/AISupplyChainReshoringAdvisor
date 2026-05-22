const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });

// Validate critical env vars
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
  console.warn('WARNING: JWT_SECRET is weak or not set. Set a strong JWT_SECRET in .env');
}
if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
  console.warn('WARNING: OPENROUTER_API_KEY not configured. AI features will use fallback mode.');
}

const authMiddleware = require('./middleware/auth');
const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Custom Views (public — mounted BEFORE auth + BEFORE 404)
app.use('/api/custom-views', require('./routes/customViews'));

// Protected routes — auth required on all /api/* except /auth, /health, /custom-views
app.use('/api', authMiddleware);

app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/risk-assessments', require('./routes/riskAssessments'));
app.use('/api/cost-analysis', require('./routes/costAnalysis'));
app.use('/api/tariff-calculations', require('./routes/tariffCalculations'));
app.use('/api/supply-chain-maps', require('./routes/supplyChainMaps'));
app.use('/api/compliance-checks', require('./routes/complianceChecks'));
app.use('/api/transport-routes', require('./routes/transportRoutes'));
app.use('/api/workforce-plans', require('./routes/workforcePlans'));
app.use('/api/site-selections', require('./routes/siteSelections'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/demand-forecasts', require('./routes/demandForecasts'));
app.use('/api/quality-assessments', require('./routes/qualityAssessments'));
app.use('/api/environmental-impacts', require('./routes/environmentalImpacts'));
app.use('/api/trade-agreements', require('./routes/tradeAgreements'));
app.use('/api/budget-plans', require('./routes/budgetPlans'));
app.use('/api/ai-center', require('./routes/aiCenter'));
app.use('/api/ai', require('./routes/aiAdvanced'));

app.use('/api/labor-arbitrage', require('./routes/laborArbitrage')); app.use('/api/resilience-scoring', require('./routes/resilienceScoring')); app.use('/api/regulatory-complexity', require('./routes/regulatoryComplexity')); app.use('/api/build-vs-partner', require('./routes/buildVsPartner')); app.use('/api/monte-carlo-scenarios', require('./routes/monteCarloScenarios')); app.use('/api/nearshoring-recommender', require('./routes/nearshoringRecommender'));
app.use('/api/port-drayage-constraint', require('./routes/portDrayageConstraint'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-ai-endpoints-under-enumerated-should-expose-labor-cost-prediction', require('./routes/gapAiEndpointsUnderEnumeratedShouldExposeLaborCostPrediction'));
app.use('/api/gap-no-scenario-comparison-endpoint', require('./routes/gapNoScenarioComparisonEndpoint'));
app.use('/api/gap-no-conversational-reshoring-advisor-chat', require('./routes/gapNoConversationalReshoringAdvisorChat'));
app.use('/api/gap-no-integrations-with-public-data-apis-bls-un', require('./routes/gapNoIntegrationsWithPublicDataApisBlsUn'));
app.use('/api/gap-no-scenario-modeling-comparison-ui-route', require('./routes/gapNoScenarioModelingComparisonUiRoute'));
app.use('/api/gap-no-feasibility-scoring-decision-tree', require('./routes/gapNoFeasibilityScoringDecisionTree'));
app.use('/api/gap-no-project-management-for-reshoring-initiatives', require('./routes/gapNoProjectManagementForReshoringInitiatives'));
app.use('/api/gap-no-webhooks-or-external-notifications', require('./routes/gapNoWebhooksOrExternalNotifications'));
app.use('/api/gap-no-multi-tenant-client-workspace-separation', require('./routes/gapNoMultiTenantClientWorkspaceSeparation'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
