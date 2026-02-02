
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SECTORS = [
    'Varejo', 'Logística', 'Finanças', 'Saúde', 'Indústria',
    'Agronegócio', 'Educação', 'Tecnologia', 'Serviços', 'Energia'
];

const LOCATIONS = [
    'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG',
    'Curitiba - PR', 'Porto Alegre - RS', 'Recife - PE',
    'Salvador - BA', 'Brasília - DF', 'Manaus - AM',
    'Remoto / Distribuído', 'Campinas - SP'
];

const PROBLEM_TEMPLATES = [
    "Otimização de custos em {context}",
    "Redução de turnover em equipes de {context}",
    "Automação de atendimento ao cliente em {context}",
    "Previsão de demanda para {context}",
    "Detecção de fraudes em {context}",
    "Melhoria da experiência do usuário em {context}",
    "Gestão de estoque eficiente para {context}",
    "Integração de sistemas legados em {context}",
    "Análise de sentimentos em {context}",
    "Eficiência energética em {context}"
];

const CONTEXTS = [
    "operações de grande escala", "startups em crescimento", "ambientes hospitalares",
    "centros de distribuição", "plataformas digitais", "redes de varejo",
    "transações financeiras", "linhas de produção", "agências de marketing",
    "setor público"
];

const generateRandomVector = (dim) => {
    return Array.from({ length: dim }, () => Math.random());
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function populate() {
    const client = await pool.connect();

    try {
        console.log("Iniciando população do banco de dados...");
        await client.query('BEGIN');

        for (let i = 0; i < 56; i++) {
            const sector = getRandom(SECTORS);
            const location = getRandom(LOCATIONS);
            const template = getRandom(PROBLEM_TEMPLATES);
            const context = getRandom(CONTEXTS);
            const description = template.replace("{context}", context) + ` (#${i + 1})`; // Ensure uniqueness

            // Mock embedding (768 dimensions usually for Gemini, but we changed to float8[])
            // We'll just put a small placeholder array since we aren't really searching strictly with pgvector right now
            // independent of dimension. The init_db said float8[].
            const embedding = generateRandomVector(10);

            // Insert Problem
            const problemRes = await client.query(
                `INSERT INTO problems (description, sector, location, embedding) VALUES ($1, $2, $3, $4) RETURNING id`,
                [description, sector, location, embedding]
            );
            const problemId = problemRes.rows[0].id;

            // Generate Mock Scenario Data
            const title = `Cenário ${i + 1}: ${description.substring(0, 30)}...`;
            const tasks = [
                {
                    id: "T1",
                    label: "Coleta de Dados",
                    description: "Coletar dados iniciais",
                    aiConfidence: Math.random(),
                    ethicalComplexity: Math.random(),
                    currentAgent: "AI", // Simplification
                    dependencies: []
                },
                {
                    id: "T2",
                    label: "Análise Humana",
                    description: "Validar insights",
                    aiConfidence: Math.random() * 0.5,
                    ethicalComplexity: 0.8,
                    currentAgent: "HUMAN",
                    dependencies: ["T1"]
                },
                {
                    id: "T3",
                    label: "Implementação Híbrida",
                    description: "Executar plano",
                    aiConfidence: 0.6,
                    ethicalComplexity: 0.4,
                    currentAgent: "SHARED",
                    dependencies: ["T2"]
                }
            ];

            // Insert Scenario
            await client.query(
                `INSERT INTO scenarios (problem_id, title, description, tasks) VALUES ($1, $2, $3, $4)`,
                [problemId, title, `Descrição detalhada do problema simulado ${i + 1}.`, JSON.stringify(tasks)]
            );

            process.stdout.write(`.`);
        }

        await client.query('COMMIT');
        console.log("\nBanco de dados povoado com 56 empresas simuladas com sucesso!");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("\nErro ao povoar banco de dados:", err);
    } finally {
        client.release();
        pool.end();
    }
}

populate();
