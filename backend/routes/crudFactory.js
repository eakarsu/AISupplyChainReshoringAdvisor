const express = require('express');
const pool = require('../db');
const { queryOpenRouter } = require('../services/openrouter');

function createCrudRouter(tableName, aiSystemPrompt, aiPromptBuilder) {
  const router = express.Router();

  // GET all
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET by id
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const fields = Object.keys(req.body).filter(k => k !== 'id' && k !== 'created_at');
      const values = fields.map(f => req.body[f]);
      const placeholders = fields.map((_, i) => `$${i + 1}`);

      const result = await pool.query(
        `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const fields = Object.keys(req.body).filter(k => k !== 'id' && k !== 'created_at');
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      const values = [...fields.map(f => req.body[f]), req.params.id];

      const result = await pool.query(
        `UPDATE ${tableName} SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully', item: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST AI analyze
  router.post('/:id/analyze', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

      const item = result.rows[0];
      const userPrompt = aiPromptBuilder(item);

      const aiResult = await queryOpenRouter(aiSystemPrompt, userPrompt);

      const analysisText = aiResult.success ? aiResult.content : (aiResult.data || aiResult.error);

      await pool.query(`UPDATE ${tableName} SET ai_analysis = $1 WHERE id = $2`, [analysisText, req.params.id]);

      // Save to ai_conversations
      await pool.query(
        `INSERT INTO ai_conversations (feature, user_prompt, ai_response, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5)`,
        [tableName, userPrompt.substring(0, 500), analysisText, aiResult.model || 'fallback', aiResult.usage?.total_tokens || 0]
      );

      res.json({
        analysis: analysisText,
        model: aiResult.model,
        usage: aiResult.usage,
        success: aiResult.success
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
