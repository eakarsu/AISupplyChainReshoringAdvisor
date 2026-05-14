/**
 * Safe migration script — only creates tables if they don't exist.
 * Run: node migrate.js
 */
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scenarios (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parameters JSONB DEFAULT '{}',
        baseline_data JSONB,
        result_data JSONB,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_ai_results_user_endpoint ON ai_results(user_id, endpoint);
      CREATE INDEX IF NOT EXISTS idx_ai_results_created_at ON ai_results(created_at);
      CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
    `);

    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
