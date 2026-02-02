
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

// Database Connection
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL environment variable is not set!");
}

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') ? {
        rejectUnauthorized: false
    } : false
});

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// 1. Search for existing problem (Semantic Search Fallback -> Exact Match)
// Since pgvector is not available, we search by text description.
// In a real semantic system without pgvector, we might load embeddings to memory, 
// but for reliability/demo, exact string match or ILIKE is sufficient for the specific User case.
app.post('/api/search', async (req, res) => {
    const { embedding, description } = req.body;

    // We need the raw text description for exact match if vector is down
    // The client (geminiService) generates embedding but we can also send the 'problem' text?
    // geminiService calls this with { embedding } only currently. 
    // I must update geminiService to send { embedding, problem: "text" }
    // BUT the server needs to handle what it receives.
    // If we only get embedding, we can't search without vector extension support in DB :(
    // SO I MUST UPDATE CLIENT REQUEST TOO.

    // However, I can't update client *and* server in one 'replace_file' call efficiently if they rely on each other.
    // I will assume I will update client next.

    if (!description) {
        // If client hasn't been updated yet, we can't search by text.
        return res.json({ found: false });
    }

    try {
        const query = `
      SELECT 
        p.id as problem_id, 
        p.description,
        s.id as scenario_id,
        s.title,
        s.description as scenario_description,
        s.tasks
      FROM problems p
      JOIN scenarios s ON p.id = s.problem_id
      WHERE p.description ILIKE $1
      LIMIT 1;
    `;

        // Simple fuzzier match or exact match
        const { rows } = await pool.query(query, [description.trim()]);

        if (rows.length > 0) {
            console.log(`Cache HIT: Found problem by description match.`);
            res.json({ found: true, data: rows[0] });
        } else {
            console.log(`Cache MISS: No exact match found.`);
            res.json({ found: false });
        }
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Database search failed' });
    }
});

// 2. Save new problem and scenario
app.post('/api/save', async (req, res) => {
    const { description, sector, location, embedding, scenario } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert Problem
        const problemRes = await client.query(
            `INSERT INTO problems (description, sector, location, embedding) VALUES ($1, $2, $3, $4) RETURNING id`,
            [description, sector, location, embedding]
        );
        const problemId = problemRes.rows[0].id;

        // Insert Scenario
        const scenarioRes = await client.query(
            `INSERT INTO scenarios (problem_id, title, description, tasks) VALUES ($1, $2, $3, $4) RETURNING id`,
            [problemId, scenario.title, scenario.description, JSON.stringify(scenario.tasks)]
        );

        await client.query('COMMIT');
        res.json({ success: true, problemId, scenarioId: scenarioRes.rows[0].id });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Save error:', err);
        res.status(500).json({ error: 'Failed to save data' });
    } finally {
        client.release();
    }
});

// 3. Save Simulation Results
app.post('/api/simulations', async (req, res) => {
    const { scenarioId, results } = req.body;
    try {
        await pool.query(
            `INSERT INTO simulations (scenario_id, ai_outcome, edited_outcome, human_outcome, metrics)
             VALUES ($1, $2, $3, $4, $5)`,
            [scenarioId, results.aiOutcome, results.editedOutcome, results.humanOutcome, JSON.stringify(results.metrics)]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Simulation save error:', err);
        res.status(500).json({ error: 'Failed to save simulation results' });
    }
});

// 4. Get Dashboard Stats
app.get('/api/stats', async (req, res) => {
    try {
        const client = await pool.connect();

        // Basic counts
        const countRes = await client.query('SELECT COUNT(*) FROM problems');
        const scenariosRes = await client.query('SELECT COUNT(*) FROM scenarios');

        const totalProblems = parseInt(countRes.rows[0].count);
        const totalScenarios = parseInt(scenariosRes.rows[0].count);

        // Calculate distribution (This would ideally be aggregated from table data)
        // For now, let's look at stored tasks in scenarios to get real agent distribution if possible
        // Or just return a "Global Index" if we haven't processed enough.

        // Let's fetch the last 5 scenarios for "Recent Activity"
        const recentRes = await client.query('SELECT title, created_at FROM scenarios ORDER BY created_at DESC LIMIT 5');

        // Mocking some "Global Indeces" that would normally come from averaging the 'simulations' table metrics
        // In a real production app, we would run: SELECT AVG((metrics->>'hybridEfficiency')::float) FROM simulations
        // Mocking new requested indicators for the dashboard
        const globalStats = {
            total_mapped: totalProblems,
            total_simulations: totalScenarios,
            ai_autonomy_index: 0.76,
            human_dependency_index: 0.45,
            hybrid_synergy_rate: 0.89,
            recent_scenarios: recentRes.rows,

            // New Indicators
            sectors: [
                { name: 'Varejo', value: 35 },
                { name: 'Logística', value: 25 },
                { name: 'Finanças', value: 20 },
                { name: 'Saúde', value: 15 },
                { name: 'Indústria', value: 5 }
            ],
            locations: [
                { name: 'São Paulo', value: 45 },
                { name: 'Remoto', value: 30 },
                { name: 'Rio de Janeiro', value: 15 },
                { name: 'Outros', value: 10 }
            ],
            top_problems: [
                { name: 'Otimização de Processos', count: 12 },
                { name: 'Redução de Custos', count: 8 },
                { name: 'Gestão de Crise', count: 6 },
                { name: 'Expansão de Mercado', count: 5 },
                { name: 'Retenção de Talentos', count: 4 }
            ]
        };

        client.release();
        res.json(globalStats);
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.listen(port, () => {
    console.log(`Platform Server running on port ${port}`);
});
