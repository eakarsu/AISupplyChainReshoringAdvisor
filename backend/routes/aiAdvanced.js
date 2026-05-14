const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { queryOpenRouter, parseAIJson } = require('../services/openrouter');

// ─── Rate Limiter ──────────────────────────────────────────────────────────────
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : req.ip,
  message: { error: 'Too many AI requests. Limit is 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Helper: persist AI result ─────────────────────────────────────────────────
async function persistAI(userId, endpoint, input, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      [userId, endpoint, JSON.stringify(input), JSON.stringify(result)]
    );
  } catch (e) { /* non-critical */ }
}

// ─── POST /api/ai/reshoring-decision ──────────────────────────────────────────
router.post('/reshoring-decision', aiRateLimiter, async (req, res) => {
  try {
    const { productSku, quantity } = req.body;
    if (!productSku) return res.status(400).json({ error: 'productSku is required' });

    // Fetch grounding data from DB
    const [suppliersRes, costsRes, tariffsRes, complianceRes] = await Promise.all([
      pool.query(`SELECT id, name, country, reliability_score, cost_rating FROM suppliers LIMIT 10`),
      pool.query(`SELECT * FROM cost_analyses WHERE product_sku = $1 LIMIT 5`, [productSku]),
      pool.query(`SELECT * FROM tariff_calculations WHERE product_sku = $1 LIMIT 5`, [productSku]),
      pool.query(`SELECT * FROM compliance_checks LIMIT 5`),
    ]);

    const systemPrompt = `You are an expert supply chain reshoring decision engine. Analyze the provided data and return a structured JSON recommendation.

Return exactly this JSON structure:
{
  "recommendation": "string describing the reshoring recommendation",
  "reshoring_score": <0-100, higher = stronger recommendation to reshore>,
  "roi_months": <estimated months to positive ROI>,
  "risk_score": <0-100, overall risk level>,
  "total_landed_cost_offshore": <estimated annual cost offshore in USD>,
  "total_landed_cost_domestic": <estimated annual cost domestic in USD>,
  "cost_savings_5yr": <5-year cost savings estimate in USD>,
  "migration_phases": [
    {"phase": 1, "name": "...", "duration_months": N, "actions": ["..."], "cost_estimate": N},
    {"phase": 2, "name": "...", "duration_months": N, "actions": ["..."], "cost_estimate": N},
    {"phase": 3, "name": "...", "duration_months": N, "actions": ["..."], "cost_estimate": N}
  ],
  "top_risks": ["...", "..."],
  "key_opportunities": ["...", "..."],
  "summary": "executive summary paragraph"
}`;

    const userPrompt = `Analyze reshoring decision for product SKU: ${productSku}
Annual quantity: ${quantity || 'unknown'}

Current Suppliers:
${JSON.stringify(suppliersRes.rows, null, 2)}

Cost Analyses:
${JSON.stringify(costsRes.rows, null, 2)}

Tariff Calculations:
${JSON.stringify(tariffsRes.rows, null, 2)}

Compliance Status:
${JSON.stringify(complianceRes.rows, null, 2)}

Provide a comprehensive reshoring decision with 5-year ROI projection.`;

    const aiResult = await queryOpenRouter(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 3000 });
    const content = aiResult.success ? aiResult.content : null;
    const parsed = content ? parseAIJson(content) : null;

    const responseText = aiResult.success ? content : aiResult.data;

    // Save to ai_conversations
    await pool.query(
      `INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)`,
      ['reshoring_decision', userPrompt.substring(0, 500), responseText, aiResult.model || 'unknown', aiResult.usage?.total_tokens || 0]
    );

    await persistAI(req.user?.id, 'reshoring-decision', { productSku, quantity }, parsed || responseText);

    res.json({
      productSku,
      analysis: parsed || responseText,
      model: aiResult.model,
      success: aiResult.success,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run reshoring decision analysis' });
  }
});

// ─── POST /api/ai/scenarios/create ────────────────────────────────────────────
router.post('/scenarios/create', async (req, res) => {
  try {
    const { name, description, parameters } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    // Capture baseline data from current DB state
    const [suppliersRes, costsRes, tariffsRes] = await Promise.all([
      pool.query('SELECT COUNT(*), AVG(reliability_score) as avg_reliability FROM suppliers'),
      pool.query('SELECT AVG(total_landed_cost) as avg_cost FROM cost_analyses'),
      pool.query('SELECT AVG(tariff_rate) as avg_tariff FROM tariff_calculations'),
    ]);

    const baselineData = {
      supplier_count: suppliersRes.rows[0].count,
      avg_supplier_reliability: suppliersRes.rows[0].avg_reliability,
      avg_landed_cost: costsRes.rows[0].avg_cost,
      avg_tariff_rate: tariffsRes.rows[0].avg_tariff,
      captured_at: new Date().toISOString(),
    };

    const result = await pool.query(
      `INSERT INTO scenarios (user_id, name, description, parameters, baseline_data, status)
       VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING *`,
      [req.user?.id, name, description, JSON.stringify(parameters || {}), JSON.stringify(baselineData)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

// ─── GET /api/ai/scenarios ─────────────────────────────────────────────────────
router.get('/scenarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM scenarios WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// ─── POST /api/ai/scenarios/:id/run ───────────────────────────────────────────
router.post('/scenarios/:id/run', aiRateLimiter, async (req, res) => {
  try {
    const scenarioRes = await pool.query('SELECT * FROM scenarios WHERE id = $1', [req.params.id]);
    if (scenarioRes.rows.length === 0) return res.status(404).json({ error: 'Scenario not found' });

    const scenario = scenarioRes.rows[0];
    const params = scenario.parameters || {};
    const baseline = scenario.baseline_data || {};

    const systemPrompt = `You are a supply chain scenario analysis AI. Compare scenario parameters against baseline data and return structured JSON analysis.

Return this JSON:
{
  "scenario_name": "...",
  "vs_baseline": {
    "cost_impact_pct": <% change in costs>,
    "risk_impact_pct": <% change in risk>,
    "lead_time_impact_pct": <% change in lead time>
  },
  "estimated_annual_impact_usd": <number>,
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "key_findings": ["...", "..."],
  "recommendations": ["...", "..."],
  "should_proceed": <boolean>
}`;

    const userPrompt = `Run scenario analysis:

Scenario: ${scenario.name}
Description: ${scenario.description || 'N/A'}
Parameters: ${JSON.stringify(params, null, 2)}

Baseline Data: ${JSON.stringify(baseline, null, 2)}

Analyze impact vs baseline and provide recommendation.`;

    const aiResult = await queryOpenRouter(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 2000 });
    const content = aiResult.success ? aiResult.content : null;
    const parsed = content ? parseAIJson(content) : null;

    // Update scenario with results
    await pool.query(
      `UPDATE scenarios SET result_data = $1, status = 'completed', updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(parsed || { raw: aiResult.data }), req.params.id]
    );

    await persistAI(req.user?.id, 'scenario-run', { scenarioId: req.params.id }, parsed);

    // Save to ai_conversations
    await pool.query(
      `INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)`,
      ['scenario_run', userPrompt.substring(0, 500), aiResult.content || '', aiResult.model || 'unknown', aiResult.usage?.total_tokens || 0]
    );

    res.json({
      scenario,
      analysis: parsed || aiResult.data,
      model: aiResult.model,
      success: aiResult.success,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run scenario' });
  }
});

// ─── GET /api/ai/suppliers/heatmap ────────────────────────────────────────────
router.get('/suppliers/heatmap', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.country,
        s.region,
        s.reliability_score,
        COALESCE(
          (SELECT AVG(r.risk_level::text::float)
           FROM risk_assessments r
           WHERE r.supplier_id = s.id
           LIMIT 1), 5
        ) as risk_score,
        COUNT(r.id) as assessment_count
      FROM suppliers s
      LEFT JOIN risk_assessments r ON r.supplier_id = s.id
      GROUP BY s.id, s.name, s.country, s.region, s.reliability_score
      ORDER BY s.country
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// ─── POST /api/ai/generate-report-pdf ─────────────────────────────────────────
router.post('/generate-report-pdf', aiRateLimiter, async (req, res) => {
  try {
    const { reportType = 'comprehensive', parameters = {} } = req.body;
    const PDFDocument = require('pdfkit');

    // Fetch data for report
    const [suppliersRes, risksRes, costsRes] = await Promise.all([
      pool.query('SELECT * FROM suppliers LIMIT 10'),
      pool.query('SELECT * FROM risk_assessments ORDER BY created_at DESC LIMIT 10'),
      pool.query('SELECT * FROM cost_analyses ORDER BY created_at DESC LIMIT 5'),
    ]);

    const systemPrompt = `You are a professional supply chain report generator. Create an executive summary.

Return JSON:
{
  "title": "...",
  "executive_summary": "...",
  "key_findings": ["...", "..."],
  "risk_overview": "...",
  "cost_overview": "...",
  "recommendations": ["...", "..."]
}`;

    const userPrompt = `Generate ${reportType} report.
Suppliers: ${suppliersRes.rows.length} total
Recent risks: ${risksRes.rows.length} assessments
Cost analyses: ${costsRes.rows.length} records
Parameters: ${JSON.stringify(parameters)}`;

    const aiResult = await queryOpenRouter(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 2000 });
    const reportData = aiResult.success ? parseAIJson(aiResult.content) : null;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reshoring-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Cover page
    doc.fontSize(24).font('Helvetica-Bold').text('Supply Chain Reshoring Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).font('Helvetica').text(reportType.toUpperCase(), { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.addPage();

    if (reportData) {
      // Executive Summary
      doc.fontSize(18).font('Helvetica-Bold').text('Executive Summary');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(reportData.executive_summary || 'N/A');
      doc.moveDown();

      // Key Findings
      if (reportData.key_findings?.length) {
        doc.fontSize(16).font('Helvetica-Bold').text('Key Findings');
        doc.moveDown(0.5);
        for (const finding of reportData.key_findings) {
          doc.fontSize(11).font('Helvetica').text(`• ${finding}`);
        }
        doc.moveDown();
      }

      // Risk Overview
      if (reportData.risk_overview) {
        doc.fontSize(16).font('Helvetica-Bold').text('Risk Overview');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(reportData.risk_overview);
        doc.moveDown();
      }

      // Recommendations
      if (reportData.recommendations?.length) {
        doc.fontSize(16).font('Helvetica-Bold').text('Recommendations');
        doc.moveDown(0.5);
        for (const rec of reportData.recommendations) {
          doc.fontSize(11).font('Helvetica').text(`• ${rec}`);
        }
        doc.moveDown();
      }
    }

    // Data summary
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold').text('Data Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
      .text(`Total Suppliers: ${suppliersRes.rows.length}`)
      .text(`Risk Assessments: ${risksRes.rows.length}`)
      .text(`Cost Analyses: ${costsRes.rows.length}`);

    doc.end();

    await persistAI(req.user?.id, 'generate-report-pdf', { reportType, parameters }, { title: reportData?.title });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }
});

// ─── POST /api/ai/labor-cost-forecast ─────────────────────────────────────────
router.post('/labor-cost-forecast', aiRateLimiter, async (req, res) => {
  try {
    const { country, region, industry, horizon_years } = req.body;
    if (!country) return res.status(400).json({ error: 'country is required' });

    const workforce = await pool.query('SELECT * FROM workforce_plans LIMIT 20').catch(() => ({ rows: [] }));

    const systemPrompt = `You are a labor economics expert. Forecast labor cost trajectory for the specified geography/industry. Return JSON only.`;
    const prompt = `Country: ${country} | Region: ${region || 'national'} | Industry: ${industry || 'general manufacturing'} | Horizon: ${horizon_years || 5} years
Workforce reference data: ${JSON.stringify(workforce.rows.slice(0, 10))}

Return JSON:
{
  "current_avg_wage_usd_hr": <number>,
  "yearly_trajectory": [{"year": <year>, "wage_usd_hr": <number>, "productivity_index": <number>}],
  "training_cost_estimate_usd": <number>,
  "key_risks": ["..."],
  "competitiveness_score": <0-100>,
  "summary": "..."
}`;
    const aiResult = await queryOpenRouter(systemPrompt, prompt);
    const parsed = aiResult.parsed || parseAIJson(aiResult.content || aiResult.data) || { raw: aiResult.content || aiResult.data };
    await persistAI(req.user?.id, 'labor-cost-forecast', { country, region, industry, horizon_years }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/ai/site-risk-score ─────────────────────────────────────────────
router.post('/site-risk-score', aiRateLimiter, async (req, res) => {
  try {
    const { siteId } = req.body;
    let site = null;
    if (siteId) {
      const r = await pool.query('SELECT * FROM site_selections WHERE id = $1', [siteId]).catch(() => ({ rows: [] }));
      site = r.rows[0] || null;
    }
    const risks = await pool.query('SELECT * FROM risk_assessments LIMIT 20').catch(() => ({ rows: [] }));
    const compliance = await pool.query('SELECT * FROM compliance_checks LIMIT 10').catch(() => ({ rows: [] }));

    const systemPrompt = `You are a site selection risk analyst. Score risk for a candidate reshoring site. Return JSON only.`;
    const prompt = `Site: ${JSON.stringify(site || req.body)}
Risk reference: ${JSON.stringify(risks.rows.slice(0, 10))}
Compliance reference: ${JSON.stringify(compliance.rows.slice(0, 5))}

Return JSON:
{
  "overall_risk_score": <0-100>,
  "geopolitical_risk": <0-100>,
  "climate_risk": <0-100>,
  "labor_risk": <0-100>,
  "infrastructure_risk": <0-100>,
  "regulatory_risk": <0-100>,
  "top_concerns": ["..."],
  "mitigations": ["..."],
  "decision_recommendation": "go|hold|reject",
  "summary": "..."
}`;
    const aiResult = await queryOpenRouter(systemPrompt, prompt);
    const parsed = aiResult.parsed || parseAIJson(aiResult.content || aiResult.data) || { raw: aiResult.content || aiResult.data };
    await persistAI(req.user?.id, 'site-risk-score', { siteId }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/ai/tariff-impact-forecast ──────────────────────────────────────
router.post('/tariff-impact-forecast', aiRateLimiter, async (req, res) => {
  try {
    const { origin_country, destination_country, hs_code, product_description, annual_units, unit_cost_usd, horizon_years } = req.body;
    if (!origin_country || !destination_country) {
      return res.status(400).json({ error: 'origin_country and destination_country are required' });
    }
    const tariffs = await pool.query('SELECT * FROM tariffs LIMIT 20').catch(() => ({ rows: [] }));

    const systemPrompt = `You are a trade-policy economist. Forecast tariff and landed-cost impact for a product moving between two countries over a multi-year horizon. Return JSON only.`;
    const prompt = `Origin: ${origin_country} | Destination: ${destination_country}
HS code: ${hs_code || 'unknown'} | Product: ${product_description || 'unspecified'}
Annual units: ${annual_units || 'unspecified'} | Unit cost (USD): ${unit_cost_usd || 'unspecified'}
Horizon: ${horizon_years || 3} years
Tariff reference data: ${JSON.stringify(tariffs.rows.slice(0, 10))}

Return JSON:
{
  "current_tariff_pct": <number>,
  "yearly_trajectory": [{"year": <year>, "tariff_pct": <number>, "landed_cost_per_unit_usd": <number>, "policy_drivers": ["..."]}],
  "annual_cost_impact_usd": <number>,
  "scenarios": [{"name": "base|escalation|de-escalation", "tariff_pct": <number>, "probability": <0-1>}],
  "mitigations": ["..."],
  "summary": "..."
}`;
    const aiResult = await queryOpenRouter(systemPrompt, prompt);
    const parsed = aiResult.parsed || parseAIJson(aiResult.content || aiResult.data) || { raw: aiResult.content || aiResult.data };
    await persistAI(req.user?.id, 'tariff-impact-forecast', { origin_country, destination_country, hs_code, horizon_years }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/ai/supply-chain-resilience-score ───────────────────────────────
router.post('/supply-chain-resilience-score', aiRateLimiter, async (req, res) => {
  try {
    const { supply_chain, suppliers, single_points_of_failure, geographies } = req.body;
    if (!supply_chain && !suppliers) {
      return res.status(400).json({ error: 'supply_chain or suppliers is required' });
    }
    const risks = await pool.query('SELECT * FROM risk_assessments LIMIT 20').catch(() => ({ rows: [] }));

    const systemPrompt = `You are a supply chain resilience analyst. Score the resilience of an end-to-end supply chain across geopolitical, supplier-concentration, logistics, and demand-shock dimensions. Return JSON only.`;
    const prompt = `Supply chain: ${typeof supply_chain === 'string' ? supply_chain : JSON.stringify(supply_chain || null)}
Suppliers: ${JSON.stringify(suppliers || [])}
Single points of failure: ${JSON.stringify(single_points_of_failure || [])}
Geographies: ${JSON.stringify(geographies || [])}
Risk reference: ${JSON.stringify(risks.rows.slice(0, 10))}

Return JSON:
{
  "overall_resilience_score": <0-100>,
  "supplier_concentration_score": <0-100>,
  "geographic_diversification_score": <0-100>,
  "logistics_redundancy_score": <0-100>,
  "demand_shock_absorption_score": <0-100>,
  "top_vulnerabilities": [{"name": "...", "severity": "low|medium|high|critical", "impact": "..."}],
  "recommendations": ["..."],
  "priority_actions": [{"action": "...", "effort": "low|medium|high", "impact": "low|medium|high"}],
  "summary": "..."
}`;
    const aiResult = await queryOpenRouter(systemPrompt, prompt);
    const parsed = aiResult.parsed || parseAIJson(aiResult.content || aiResult.data) || { raw: aiResult.content || aiResult.data };
    await persistAI(req.user?.id, 'supply-chain-resilience-score', { suppliers_count: Array.isArray(suppliers) ? suppliers.length : null }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/ai/history ──────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI history' });
  }
});

module.exports = router;
