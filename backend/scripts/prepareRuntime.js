'use strict';
const bcrypt = require('bcryptjs');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../db');

async function prepare() {
  if (!['1', 'true'].includes(String(process.env.ALLOW_SCHEMA_MIGRATION || '').toLowerCase())) {
    throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'analyst',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id SERIAL PRIMARY KEY,
      feature VARCHAR(100) NOT NULL,
      user_prompt TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      model_used VARCHAR(255) NOT NULL,
      tokens_used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      endpoint VARCHAR(100) NOT NULL,
      input_data JSONB NOT NULL,
      result JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_results_user_endpoint ON ai_results(user_id, endpoint);
  `);
  const governanceMigration = fs.readFileSync(
    path.resolve(__dirname, '../migrations/001_governed_workflows.sql'),
    'utf8',
  );
  await pool.query(governanceMigration);

  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Admin';
  if (!email || String(password || '').length < 12) throw new Error('Provisioned admin credentials are required');
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users(email,password,name,role) VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin'`,
    [email, passwordHash, name],
  );
}

prepare()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Runtime preparation failed:', error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });
