// Custom Views — 4 endpoints for AISupplyChainReshoringAdvisor
// VIZ:    /scenario-comparison         (chart series: cost + risk per scenario)
// VIZ:    /cost-risk-heatmap           (country x factor matrix)
// NON-VIZ /analysis-pdf                (binary PDF report)
// NON-VIZ /evaluation-rules            (CRUD: GET/POST/PUT/DELETE rule weights + criteria)
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const rateLimitPkg = require('express-rate-limit');
const rateLimit = rateLimitPkg.rateLimit || rateLimitPkg;
const ipKeyGenerator = rateLimitPkg.ipKeyGenerator;

let pool = null;
try { pool = require('../db'); } catch (_) { /* fallback to in-memory */ }

const cvLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator ? ipKeyGenerator(req.ip || '0.0.0.0') : (req.ip || 'anon'),
});
router.use(cvLimiter);

// ---------- bootstrap evaluation_rules table (lazy) ----------
let _rulesInit = false;
async function ensureRulesTable() {
  if (_rulesInit || !pool) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS supplier_evaluation_rules (
      id SERIAL PRIMARY KEY,
      criterion TEXT NOT NULL,
      weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
      direction TEXT NOT NULL DEFAULT 'higher_better',
      threshold NUMERIC(10,2),
      notes TEXT,
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM supplier_evaluation_rules');
    if (rows[0].n === 0) {
      const seed = [
        ['total_landed_cost', 0.30, 'lower_better', null, 'All-in landed cost vs baseline'],
        ['lead_time_days',    0.15, 'lower_better', 30,   'Avg lead time in days'],
        ['quality_score',     0.20, 'higher_better', null,'Quality / defect score'],
        ['geopolitical_risk', 0.15, 'lower_better', null, 'Country geopolitical risk index'],
        ['tariff_exposure',   0.10, 'lower_better', null, 'Tariff & trade barrier exposure'],
        ['esg_score',         0.10, 'higher_better', null,'ESG / sustainability score'],
      ];
      for (const r of seed) {
        await pool.query(
          'INSERT INTO supplier_evaluation_rules(criterion,weight,direction,threshold,notes) VALUES ($1,$2,$3,$4,$5)',
          r
        );
      }
    }
    _rulesInit = true;
  } catch (_) { /* ignore */ }
}

// ---------- helpers ----------
function loadScenariosFromInput(body) {
  if (Array.isArray(body?.scenarios) && body.scenarios.length) {
    return body.scenarios.map((s, i) => ({
      name: s.name || `Scenario ${i + 1}`,
      country: s.country || 'N/A',
      landed_cost: Number(s.landed_cost ?? s.cost ?? 0),
      risk_score:  Number(s.risk_score  ?? s.risk ?? 0),
      lead_time:   Number(s.lead_time   ?? 0),
      tariff_pct:  Number(s.tariff_pct  ?? 0),
    }));
  }
  return [
    { name: 'Offshore (China)',    country: 'CN', landed_cost: 100, risk_score: 7.4, lead_time: 42, tariff_pct: 25 },
    { name: 'Nearshore (Mexico)',  country: 'MX', landed_cost: 118, risk_score: 4.2, lead_time: 12, tariff_pct: 0 },
    { name: 'Reshore (USA-TX)',    country: 'US', landed_cost: 134, risk_score: 2.1, lead_time: 5,  tariff_pct: 0 },
    { name: 'Reshore (USA-OH)',    country: 'US', landed_cost: 138, risk_score: 2.0, lead_time: 6,  tariff_pct: 0 },
    { name: 'Hybrid (VN+US)',      country: 'VN', landed_cost: 112, risk_score: 5.6, lead_time: 24, tariff_pct: 10 },
  ];
}

function loadHeatmapFromInput(body) {
  const countries = body?.countries?.length ? body.countries
    : ['China', 'Vietnam', 'Mexico', 'USA-TX', 'USA-OH', 'India'];
  const factors = body?.factors?.length ? body.factors
    : ['Labor Cost', 'Logistics', 'Tariff', 'Geopolitical', 'Quality Risk', 'ESG'];
  // Deterministic pseudo values
  function v(c, f) {
    const seed = (c.length * 7 + f.length * 13) % 9;
    const base = (c.charCodeAt(0) + f.charCodeAt(0)) % 10;
    return Math.max(0, Math.min(10, Math.round((base + seed) % 10)));
  }
  const matrix = countries.map(c =>
    factors.map(f => v(c, f))
  );
  return { countries, factors, matrix };
}

// ====================================================================
// 1) VIZ — Scenario Comparison Chart (data feed for FE bar chart)
// ====================================================================
router.post('/scenario-comparison', async (req, res) => {
  try {
    const scenarios = loadScenariosFromInput(req.body);
    const labels = scenarios.map(s => s.name);
    res.json({
      success: true,
      kind: 'viz_scenario_comparison',
      labels,
      series: [
        { key: 'landed_cost', label: 'Landed Cost (idx)', color: '#3b82f6',
          data: scenarios.map(s => s.landed_cost) },
        { key: 'risk_score',  label: 'Risk Score (0-10)', color: '#ef4444',
          data: scenarios.map(s => s.risk_score) },
        { key: 'lead_time',   label: 'Lead Time (days)',  color: '#10b981',
          data: scenarios.map(s => s.lead_time) },
      ],
      scenarios,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'scenario-comparison failed' });
  }
});

router.get('/scenario-comparison', async (req, res) => {
  // GET defaults — for easy verification
  req.body = {};
  return router.handle({ ...req, method: 'POST', url: '/scenario-comparison' }, res, () => {});
});

// ====================================================================
// 2) VIZ — Cost + Risk Heatmap (country x factor)
// ====================================================================
router.post('/cost-risk-heatmap', async (req, res) => {
  try {
    const data = loadHeatmapFromInput(req.body);
    res.json({
      success: true,
      kind: 'viz_cost_risk_heatmap',
      ...data,
      scale: { min: 0, max: 10, low_color: '#10b981', mid_color: '#f59e0b', high_color: '#ef4444' },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'cost-risk-heatmap failed' });
  }
});

router.get('/cost-risk-heatmap', async (req, res) => {
  req.body = {};
  return router.handle({ ...req, method: 'POST', url: '/cost-risk-heatmap' }, res, () => {});
});

// ====================================================================
// 3) NON-VIZ — Reshoring Analysis PDF
// ====================================================================
function streamAnalysisPdf(res, payload) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 56 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="reshoring-analysis-${Date.now()}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).fillColor('#1e3a8a').text('Reshoring Decision Analysis', { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#475569').text(`Generated ${new Date().toUTCString()}`);
  doc.moveDown(0.8);

  doc.fontSize(13).fillColor('#0f172a').text('Executive Summary');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#1e293b').text(
    payload.summary ||
    'This report compares reshoring scenarios across landed cost, lead time, tariff exposure, and geopolitical risk. Reshore (USA-TX) carries a 34% landed-cost premium but reduces lead time by ~88% and eliminates tariff exposure.',
    { align: 'justify' }
  );
  doc.moveDown(0.8);

  const scenarios = payload.scenarios || loadScenariosFromInput({});
  doc.fontSize(13).fillColor('#0f172a').text('Scenario Comparison');
  doc.moveDown(0.4);
  const headers = ['Scenario', 'Country', 'Cost', 'Risk', 'Lead', 'Tariff%'];
  const colX = [56, 200, 290, 340, 390, 450];
  doc.fontSize(10).fillColor('#0f172a');
  headers.forEach((h, i) => doc.text(h, colX[i], doc.y, { continued: i < headers.length - 1, width: 90 }));
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor('#1e293b');
  scenarios.forEach(s => {
    const y = doc.y;
    doc.text(String(s.name).slice(0, 26), colX[0], y, { width: 140 });
    doc.text(String(s.country),            colX[1], y, { width: 80 });
    doc.text(String(s.landed_cost),        colX[2], y, { width: 40 });
    doc.text(String(s.risk_score),         colX[3], y, { width: 40 });
    doc.text(String(s.lead_time),          colX[4], y, { width: 50 });
    doc.text(String(s.tariff_pct),         colX[5], y, { width: 60 });
    doc.moveDown(0.15);
  });

  doc.moveDown(0.8);
  doc.fontSize(13).fillColor('#0f172a').text('Recommendations');
  doc.moveDown(0.3);
  const recs = payload.recommendations || [
    'Pilot reshore for high-IP / high-tariff SKUs (target 20-30% of volume).',
    'Maintain dual-source nearshore (Mexico) for cost-sensitive long-cycle SKUs.',
    'Negotiate 24-month landed-cost lock with reshore partner; hedge labor index.',
    'Re-evaluate every 6 months as tariff schedule and FX move.',
  ];
  doc.fontSize(10).fillColor('#1e293b');
  recs.forEach((r, i) => doc.text(`${i + 1}. ${r}`));

  doc.moveDown(0.8);
  doc.fontSize(8).fillColor('#94a3b8').text(
    'AI Supply Chain Reshoring Advisor — Custom Views / Analysis PDF',
    { align: 'center' }
  );

  doc.end();
}

router.post('/analysis-pdf', (req, res) => {
  try {
    streamAnalysisPdf(res, req.body || {});
  } catch (err) {
    res.status(500).json({ error: err.message || 'analysis-pdf failed' });
  }
});

router.get('/analysis-pdf', (req, res) => {
  try {
    streamAnalysisPdf(res, {});
  } catch (err) {
    res.status(500).json({ error: err.message || 'analysis-pdf failed' });
  }
});

// ====================================================================
// 4) NON-VIZ — Supplier Evaluation Rules (CRUD: weights, criteria)
// ====================================================================
const memRules = [
  { id: 1, criterion: 'total_landed_cost', weight: 0.30, direction: 'lower_better',  threshold: null, notes: 'All-in landed cost vs baseline', enabled: true },
  { id: 2, criterion: 'lead_time_days',    weight: 0.15, direction: 'lower_better',  threshold: 30,   notes: 'Avg lead time in days',           enabled: true },
  { id: 3, criterion: 'quality_score',     weight: 0.20, direction: 'higher_better', threshold: null, notes: 'Quality / defect score',          enabled: true },
  { id: 4, criterion: 'geopolitical_risk', weight: 0.15, direction: 'lower_better',  threshold: null, notes: 'Country geopolitical risk index', enabled: true },
  { id: 5, criterion: 'tariff_exposure',   weight: 0.10, direction: 'lower_better',  threshold: null, notes: 'Tariff & trade barrier exposure', enabled: true },
  { id: 6, criterion: 'esg_score',         weight: 0.10, direction: 'higher_better', threshold: null, notes: 'ESG / sustainability score',      enabled: true },
];
let memSeq = memRules.length + 1;

async function listRules() {
  await ensureRulesTable();
  if (!pool) return memRules;
  try {
    const { rows } = await pool.query('SELECT * FROM supplier_evaluation_rules ORDER BY id ASC');
    return rows.map(r => ({ ...r, weight: Number(r.weight), threshold: r.threshold == null ? null : Number(r.threshold) }));
  } catch (_) { return memRules; }
}

router.get('/evaluation-rules', async (req, res) => {
  try {
    const rules = await listRules();
    const totalWeight = rules.filter(r => r.enabled).reduce((a, r) => a + Number(r.weight || 0), 0);
    res.json({ success: true, kind: 'rules_crud', rules, total_weight: Number(totalWeight.toFixed(4)) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'evaluation-rules GET failed' });
  }
});

router.post('/evaluation-rules', async (req, res) => {
  try {
    await ensureRulesTable();
    const { criterion, weight = 0.1, direction = 'higher_better', threshold = null, notes = '', enabled = true } = req.body || {};
    if (!criterion) return res.status(400).json({ error: 'criterion required' });
    if (pool) {
      try {
        const { rows } = await pool.query(
          'INSERT INTO supplier_evaluation_rules(criterion,weight,direction,threshold,notes,enabled) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
          [criterion, weight, direction, threshold, notes, enabled]
        );
        return res.status(201).json({ success: true, rule: rows[0] });
      } catch (_) { /* fall through to memory */ }
    }
    const rule = { id: memSeq++, criterion, weight: Number(weight), direction, threshold, notes, enabled: !!enabled };
    memRules.push(rule);
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ error: err.message || 'evaluation-rules POST failed' });
  }
});

router.put('/evaluation-rules/:id', async (req, res) => {
  try {
    await ensureRulesTable();
    const id = parseInt(req.params.id, 10);
    const { criterion, weight, direction, threshold, notes, enabled } = req.body || {};
    if (pool) {
      try {
        const { rows } = await pool.query(
          `UPDATE supplier_evaluation_rules SET
              criterion = COALESCE($1, criterion),
              weight = COALESCE($2, weight),
              direction = COALESCE($3, direction),
              threshold = COALESCE($4, threshold),
              notes = COALESCE($5, notes),
              enabled = COALESCE($6, enabled),
              updated_at = NOW()
           WHERE id = $7 RETURNING *`,
          [criterion ?? null, weight ?? null, direction ?? null, threshold ?? null, notes ?? null, enabled ?? null, id]
        );
        if (!rows.length) return res.status(404).json({ error: 'not found' });
        return res.json({ success: true, rule: rows[0] });
      } catch (_) { /* fall through */ }
    }
    const idx = memRules.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    memRules[idx] = { ...memRules[idx], ...(criterion !== undefined && { criterion }), ...(weight !== undefined && { weight: Number(weight) }), ...(direction !== undefined && { direction }), ...(threshold !== undefined && { threshold }), ...(notes !== undefined && { notes }), ...(enabled !== undefined && { enabled: !!enabled }) };
    res.json({ success: true, rule: memRules[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'evaluation-rules PUT failed' });
  }
});

router.delete('/evaluation-rules/:id', async (req, res) => {
  try {
    await ensureRulesTable();
    const id = parseInt(req.params.id, 10);
    if (pool) {
      try {
        const { rows } = await pool.query('DELETE FROM supplier_evaluation_rules WHERE id=$1 RETURNING *', [id]);
        if (!rows.length) return res.status(404).json({ error: 'not found' });
        return res.json({ success: true, deleted: rows[0] });
      } catch (_) { /* fall through */ }
    }
    const idx = memRules.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    const [deleted] = memRules.splice(idx, 1);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message || 'evaluation-rules DELETE failed' });
  }
});

module.exports = router;
