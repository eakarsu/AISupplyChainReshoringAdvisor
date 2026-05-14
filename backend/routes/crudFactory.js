const express = require('express');
const pool = require('../db');
const { queryOpenRouter } = require('../services/openrouter');

// Allowed columns per table (whitelist to prevent SQL injection)
const ALLOWED_COLUMNS = {
  suppliers: ['name', 'country', 'region', 'category', 'contact_name', 'contact_email', 'phone', 'address', 'annual_revenue', 'employee_count', 'risk_score', 'reliability_score', 'quality_score', 'cost_score', 'sustainability_score', 'ai_analysis', 'status', 'notes'],
  risk_assessments: ['supplier_id', 'risk_type', 'risk_level', 'probability', 'impact', 'description', 'mitigation_strategy', 'status', 'reviewed_at', 'ai_analysis'],
  cost_analyses: ['supplier_id', 'product_sku', 'offshore_cost', 'domestic_cost', 'logistics_cost', 'tariff_cost', 'total_landed_cost', 'currency', 'analysis_date', 'notes', 'ai_analysis'],
  tariff_calculations: ['product_sku', 'hs_code', 'origin_country', 'destination_country', 'tariff_rate', 'base_cost', 'tariff_amount', 'total_cost', 'trade_agreement', 'effective_date', 'notes', 'ai_analysis'],
  supply_chain_maps: ['name', 'description', 'product_line', 'tier_level', 'supplier_id', 'parent_id', 'country', 'risk_level', 'map_data', 'ai_analysis'],
  compliance_checks: ['supplier_id', 'standard', 'status', 'score', 'last_audit_date', 'next_audit_date', 'findings', 'corrective_actions', 'auditor', 'ai_analysis'],
  transport_routes: ['origin', 'destination', 'mode', 'carrier', 'transit_days', 'cost_per_unit', 'reliability_score', 'carbon_footprint', 'route_data', 'ai_analysis'],
  workforce_plans: ['site_id', 'department', 'current_headcount', 'planned_headcount', 'skill_requirements', 'training_cost', 'recruitment_timeline', 'status', 'notes', 'ai_analysis'],
  site_selections: ['name', 'country', 'state', 'city', 'area_sqft', 'lease_cost', 'purchase_cost', 'labor_cost_index', 'infrastructure_score', 'incentives', 'status', 'notes', 'ai_analysis'],
  inventory_items: ['sku', 'name', 'category', 'supplier_id', 'current_stock', 'reorder_point', 'lead_time_days', 'unit_cost', 'carrying_cost', 'status', 'ai_analysis'],
  demand_forecasts: ['product_sku', 'forecast_date', 'period', 'forecasted_demand', 'actual_demand', 'accuracy', 'method', 'confidence_interval', 'notes', 'ai_analysis'],
  quality_assessments: ['supplier_id', 'product_sku', 'assessment_date', 'defect_rate', 'return_rate', 'customer_satisfaction', 'certifications', 'findings', 'score', 'ai_analysis'],
  environmental_impacts: ['supplier_id', 'category', 'carbon_emissions', 'water_usage', 'waste_generated', 'renewable_energy_pct', 'esg_score', 'reporting_period', 'notes', 'ai_analysis'],
  trade_agreements: ['name', 'countries', 'effective_date', 'expiry_date', 'tariff_reductions', 'rules_of_origin', 'sectors', 'status', 'notes', 'ai_analysis'],
  budget_plans: ['name', 'fiscal_year', 'department', 'capex_budget', 'opex_budget', 'actual_spend', 'variance', 'status', 'notes', 'ai_analysis'],
};

function getAllowedColumns(tableName) {
  return ALLOWED_COLUMNS[tableName] || [];
}

function filterBody(body, allowedCols) {
  const filtered = {};
  for (const key of allowedCols) {
    if (body[key] !== undefined) filtered[key] = body[key];
  }
  return filtered;
}

function createCrudRouter(tableName, aiSystemPrompt, aiPromptBuilder) {
  const router = express.Router();
  const allowedCols = getAllowedColumns(tableName);

  // GET all with pagination + filtering
  router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 20, sort = 'created_at', order = 'DESC', ...filters } = req.query;
      const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
      const pageSize = Math.min(100, parseInt(limit));

      // Only allow sorting on known columns + created_at
      const safeSortCols = [...allowedCols, 'id', 'created_at', 'updated_at'];
      const safeSort = safeSortCols.includes(sort) ? sort : 'created_at';
      const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Build filter conditions (only on allowed columns)
      const conditions = [];
      const params = [pageSize, offset];
      let paramIdx = 3;
      for (const [key, val] of Object.entries(filters)) {
        if (allowedCols.includes(key) && val !== undefined && val !== '') {
          conditions.push(`${key} ILIKE $${paramIdx}`);
          params.push(`%${val}%`);
          paramIdx++;
        }
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${tableName} ${whereClause}`,
        params.slice(2)
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query(
        `SELECT * FROM ${tableName} ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT $1 OFFSET $2`,
        params
      );

      res.json({
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  });

  // GET by id
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch record' });
    }
  });

  // POST create — whitelist columns
  router.post('/', async (req, res) => {
    try {
      const safeBody = filterBody(req.body, allowedCols);
      if (Object.keys(safeBody).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided' });
      }

      const fields = Object.keys(safeBody);
      const values = fields.map(f => safeBody[f]);
      const placeholders = fields.map((_, i) => `$${i + 1}`);

      const result = await pool.query(
        `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create record' });
    }
  });

  // PUT update — whitelist columns
  router.put('/:id', async (req, res) => {
    try {
      const safeBody = filterBody(req.body, allowedCols);
      if (Object.keys(safeBody).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided' });
      }

      const fields = Object.keys(safeBody);
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      const values = [...fields.map(f => safeBody[f]), req.params.id];

      const result = await pool.query(
        `UPDATE ${tableName} SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update record' });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully', item: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete record' });
    }
  });

  // POST AI analyze — persists to ai_results
  router.post('/:id/analyze', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

      const item = result.rows[0];
      const userPrompt = aiPromptBuilder(item);

      const aiResult = await queryOpenRouter(aiSystemPrompt, userPrompt);
      const analysisText = aiResult.success ? aiResult.content : (aiResult.data || aiResult.error);

      // Update record with analysis
      const updateCols = getAllowedColumns(tableName);
      if (updateCols.includes('ai_analysis')) {
        await pool.query(`UPDATE ${tableName} SET ai_analysis = $1 WHERE id = $2`, [analysisText, item.id]);
      }

      // Save to ai_conversations
      await pool.query(
        `INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)`,
        [tableName, userPrompt.substring(0, 500), analysisText, aiResult.model || 'unknown', aiResult.usage?.total_tokens || 0]
      );

      // Persist to ai_results
      await pool.query(
        `INSERT INTO ai_results (user_id, endpoint, input_data, result, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [req.user?.id || null, `${tableName}/analyze`, JSON.stringify({ id: item.id }), JSON.stringify({ analysis: analysisText })]
      ).catch(() => {}); // non-critical

      res.json({
        analysis: analysisText,
        model: aiResult.model,
        usage: aiResult.usage,
        success: aiResult.success,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze record' });
    }
  });

  return router;
}

module.exports = createCrudRouter;
