const express = require('express');
const router = express.Router();
const pool = require('../db');
const { queryOpenRouter } = require('../services/openrouter');

// AI Chat - General supply chain assistant
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const systemPrompt = `You are an expert AI Supply Chain Reshoring Advisor. You help companies analyze, plan, and execute reshoring strategies for their supply chains. You have deep knowledge of:
- Global supply chain dynamics and risks
- Tariff policies and trade agreements
- Manufacturing cost analysis
- Logistics optimization
- Regulatory compliance
- Workforce planning
- Environmental sustainability
- Financial planning and ROI analysis

Provide professional, actionable advice. Use clear formatting with headers and bullet points.`;

    const result = await queryOpenRouter(systemPrompt, message);
    const responseText = result.success ? result.content : (result.data || result.error);

    await pool.query(
      'INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      ['ai_chat', message, responseText, result.model || 'fallback', result.usage?.total_tokens || 0]
    );

    res.json({ response: responseText, model: result.model, usage: result.usage, success: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Report Generator
router.post('/generate-report', async (req, res) => {
  try {
    const { reportType, parameters } = req.body;
    const systemPrompt = `You are a professional supply chain report generator. Create comprehensive, well-structured reports with executive summaries, key findings, data analysis, and actionable recommendations. Format the report professionally with clear sections, headers, and bullet points.`;

    const userPrompt = `Generate a comprehensive ${reportType} report for supply chain reshoring analysis.
Parameters: ${JSON.stringify(parameters)}

Include: Executive Summary, Key Findings, Detailed Analysis, Risk Assessment, Financial Impact, Recommendations, and Next Steps.`;

    const result = await queryOpenRouter(systemPrompt, userPrompt);
    const responseText = result.success ? result.content : (result.data || result.error);

    await pool.query(
      'INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      ['report_generator', userPrompt.substring(0, 500), responseText, result.model || 'fallback', result.usage?.total_tokens || 0]
    );

    res.json({ report: responseText, model: result.model, success: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Scenario Simulator
router.post('/simulate-scenario', async (req, res) => {
  try {
    const { scenario } = req.body;
    const systemPrompt = `You are a supply chain scenario simulation expert. Analyze hypothetical scenarios and predict outcomes based on supply chain dynamics, economic factors, and industry trends. Provide detailed impact analysis with probability assessments and recommended responses.`;

    const userPrompt = `Simulate and analyze this supply chain reshoring scenario:
${scenario}

Provide: 1) Scenario Analysis 2) Probability of Outcomes 3) Impact Assessment (Financial, Operational, Strategic) 4) Timeline of Effects 5) Recommended Response Plan 6) Contingency Measures`;

    const result = await queryOpenRouter(systemPrompt, userPrompt);
    const responseText = result.success ? result.content : (result.data || result.error);

    await pool.query(
      'INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      ['scenario_simulator', scenario.substring(0, 500), responseText, result.model || 'fallback', result.usage?.total_tokens || 0]
    );

    res.json({ simulation: responseText, model: result.model, success: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Market Intelligence
router.post('/market-intelligence', async (req, res) => {
  try {
    const { query } = req.body;
    const systemPrompt = `You are a market intelligence analyst specializing in global supply chains, manufacturing, and reshoring trends. Provide data-driven market insights, competitive analysis, and strategic intelligence. Use specific examples and industry data points.`;

    const userPrompt = `Provide market intelligence analysis on: ${query}

Include: 1) Market Overview 2) Key Trends 3) Competitive Landscape 4) Reshoring Opportunities 5) Risk Factors 6) Strategic Recommendations`;

    const result = await queryOpenRouter(systemPrompt, userPrompt);
    const responseText = result.success ? result.content : (result.data || result.error);

    await pool.query(
      'INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      ['market_intelligence', query.substring(0, 500), responseText, result.model || 'fallback', result.usage?.total_tokens || 0]
    );

    res.json({ intelligence: responseText, model: result.model, success: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Risk Monitor
router.post('/risk-monitor', async (req, res) => {
  try {
    const { context } = req.body;
    const systemPrompt = `You are a real-time supply chain risk monitoring AI. Analyze current conditions and identify emerging risks to supply chains. Provide risk alerts with severity levels, affected areas, and immediate action items.`;

    const userPrompt = `Perform a comprehensive risk scan for supply chain reshoring operations.
Context: ${context}

Provide: 1) Current Risk Dashboard (Critical/High/Medium/Low) 2) Emerging Threats 3) Geopolitical Risk Factors 4) Economic Indicators 5) Immediate Action Items 6) 30/60/90 Day Outlook`;

    const result = await queryOpenRouter(systemPrompt, userPrompt);
    const responseText = result.success ? result.content : (result.data || result.error);

    await pool.query(
      'INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      ['risk_monitor', context.substring(0, 500), responseText, result.model || 'fallback', result.usage?.total_tokens || 0]
    );

    res.json({ riskReport: responseText, model: result.model, success: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI conversation history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_conversations ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
