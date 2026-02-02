
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const schema = `
  -- We removed vector extension due to server limitations.
  -- Storing embeddings as float8[] for potential future use.

  -- Table to store unique problems/challenges
  CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL UNIQUE,
    sector TEXT,
    location TEXT,
    embedding FLOAT8[], -- Changed from VECTOR(768) to FLOAT8[]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Table to store the scenarios generated for a problem
  CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    tasks JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Table to store simulation results
  CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    ai_outcome TEXT,
    edited_outcome TEXT,
    human_outcome TEXT,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initDB() {
  const client = await pool.connect();
  try {
    console.log("Connecting to database...");
    await client.query('BEGIN');
    // Drop tables if they exist to reset schema with valid types (since previous partial run might have failed or left partials)
    // Actually, safest is to drop if exists since we are initializing.
    await client.query('DROP TABLE IF EXISTS simulations');
    await client.query('DROP TABLE IF EXISTS scenarios');
    await client.query('DROP TABLE IF EXISTS problems');

    await client.query(schema);
    await client.query('COMMIT');
    console.log("Database initialized successfully (Schema Only - No Vector Ext).");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Failed to initialize database:", e);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
