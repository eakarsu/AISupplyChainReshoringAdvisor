const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
