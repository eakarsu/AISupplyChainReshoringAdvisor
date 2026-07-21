const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });

// Validate critical env vars
if ((process.env.JWT_SECRET || '').length < 32 || !process.env.GOVERNANCE_TENANT_ID || !process.env.DATABASE_URL) throw new Error('JWT_SECRET (32+ characters), GOVERNANCE_TENANT_ID, and DATABASE_URL are required');

const authMiddleware = require('./middleware/auth');
const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 4000;
const generatedRoutesEnabled = process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production';

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

// Custom views require the same signed identity as other data routes.
app.use('/api/custom-views', authMiddleware, require('./routes/customViews'));

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
if (generatedRoutesEnabled) app.use('/api/ai-center', require('./routes/aiCenter'));
if (generatedRoutesEnabled) app.use('/api/ai', require('./routes/aiAdvanced'));

app.use('/api/governed-reshoring-advice', require('./governance'));
app.use('/api/governance', require('./governance'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
