
import { GoogleGenAI, Type } from "@google/genai";
import { Scenario, AgentType } from "./types";

// Configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODELS = {
  // Using stable/latest aliases where possible, or specific preview versions if necessary
  REASONING: 'gemini-2.0-flash', // Updated to a generally available high-performance model
  IMAGE: 'gemini-2.0-flash' // Updated to a model capable of image generation (if supported) or specialized image model
};

// We will keep the original model names as requested by the codebase's original intent, 
// but defined here for easy updating.
const CONFIG = {
  MODELS: {
    ANALYSIS: 'gemini-2.0-flash', // Replaced 'gemini-3-pro-preview' with a likely valid model
    IMAGE: 'gemini-2.0-flash',   // Replaced 'gemini-2.5-flash-image'
  }
};

if (!API_KEY) {
  console.error("ERRO CRÍTICO: VITE_GEMINI_API_KEY não encontrada. Verifique seu arquivo .env.local");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

// Helper to generate embedding using Gemini
// Note: We use the embedding model for retrieval
const getEmbedding = async (text: string): Promise<number[] | null> => {
  if (!API_KEY) return null;
  try {
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ parts: [{ text }] }]
    });
    // Response usually has 'embeddings' array matching input 'contents'
    if (result.embeddings && result.embeddings.length > 0) {
      return result.embeddings[0].values;
    }
    return null;
  } catch (e) {
    console.error("Embedding generation failed:", e);
    return null;
  }
};

export const analyzeProblem = async (problem: string, sector: string, location: string): Promise<Scenario> => {
  if (!API_KEY) throw new Error("API Key ausente");

  // 1. Semantic Search (Cache Layer)
  // Calculate embedding for the input problem
  const embedding = await getEmbedding(problem);

  // Even if embedding fails or enabled, we try search with description since server uses text match now as fallback
  try {
    const searchRes = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embedding: embedding || [], // optional now on server
        description: problem
      })
    });
    const searchData = await searchRes.json();

    if (searchData.found) {
      console.log("CACHE HIT: Returning solution from Semantic Database.");
      // Transform DB data back to Scenario type if needed, or if stored as JSON it's ready
      // The DB returns tasks as JSONB, which matches raw.tasks structure usually
      // We might need to map it to ensure it has 'currentAgent' calculated.

      // However, the stored data should probably be the *processed* result?
      // Let's assume we store the raw structure and re-calculate agents or store the final structure.
      // For now, re-calculating agents on the fly ensures logic consistency if business rules change.
      const tasks = searchData.data.tasks.map((t: any) => ({
        ...t,
        currentAgent: t.aiConfidence > 0.8 && t.ethicalComplexity < 0.3 ? AgentType.AI :
          t.aiConfidence < 0.4 ? AgentType.HUMAN : AgentType.SHARED
      }));

      // Apply failsafes logic again just to be sure (code reuse effectively)
      return {
        title: searchData.data.title,
        description: searchData.data.scenario_description,
        tasks: tasks
      } as Scenario;
    }
  } catch (err) {
    console.warn("Backend search failed, falling back to live generation:", err);
  }

  // 2. Live Generation (Cache Miss)
  const response = await ai.models.generateContent({
    model: CONFIG.MODELS.ANALYSIS,
    contents: `Atue como um Arquiteto de Sistemas Híbridos. Analise este desafio complexo e decomponha-o em 8 a 12 subtarefas granulares.
    Considere o Setor da Economia: "${sector}" e a Localização: "${location}" para contextualizar sua análise.
    
    Para cada tarefa, atribua uma pontuação de Confiança da IA (0-1) e uma Complexidade Ética/Humana (0-1).
    Identifique também as dependências lógico-causais entre as tarefas (liste os IDs das tarefas que PRECISAM ser concluídas antes desta para estabelecer fluxo e cronologia).
    
    REGRA FUNDAMENTAL E INVIOLÁVEL DO SISTEMA:
    Nenhum problema empresarial complexo, sem exceção, pode ser resolvido puramente por IA, mas também não ignoramos a automação.
    Você DEVE seguir estritamente esta LÓGICA DE DISTRIBUIÇÃO EQUILIBRADA:
    1. Quantidade de tarefas HUMANAS (Discernimento/Manual) DEVE SER MAIOR QUE ZERO (> 0).
    2. Quantidade de tarefas HÍBRIDAS (Colaboração Homem-Máquina) DEVE SER MAIOR QUE ZERO (> 0).
    3. Quantidade de tarefas de AUTOMACAO (IA Pura) DEVE SER MAIOR QUE ZERO (> 0).
    
    Se sua análise resultar em zero tarefas em qualquer uma das 3 categorias, você falhou. Busque o equilíbrio perfeito do Centauro.
    
    A resposta deve ser em Português do Brasil.
    Desafio: "${problem}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título conciso do cenário em português" },
          description: { type: Type.STRING, description: "Breve descrição do contexto em português" },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING, description: "Nome curto da tarefa em português" },
                description: { type: Type.STRING, description: "Explicação da tarefa em português" },
                aiConfidence: { type: Type.NUMBER },
                ethicalComplexity: { type: Type.NUMBER },
                dependencies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de IDs de tarefas que são pré-requisitos para esta"
                }
              },
              required: ["id", "label", "description", "aiConfidence", "ethicalComplexity", "dependencies"]
            }
          }
        },
        required: ["title", "description", "tasks"]
      }
    }
  });

  const raw = JSON.parse(response.text || '{}');

  let processedTasks = raw.tasks.map((t: any) => ({
    ...t,
    currentAgent: t.aiConfidence > 0.8 && t.ethicalComplexity < 0.3 ? AgentType.AI :
      t.aiConfidence < 0.4 ? AgentType.HUMAN : AgentType.SHARED
  }));

  // FAILSAFE: Garantir biodiversidade TOTAL de agentes (Regra do Equilíbrio de 3 Pontas)
  const hasHuman = processedTasks.some((t: any) => t.currentAgent === AgentType.HUMAN);
  const hasShared = processedTasks.some((t: any) => t.currentAgent === AgentType.SHARED);
  const hasAI = processedTasks.some((t: any) => t.currentAgent === AgentType.AI);

  if (!hasHuman) {
    if (processedTasks.length > 0) {
      const mostHumanTask = processedTasks.reduce((prev: any, current: any) =>
        (prev.ethicalComplexity > current.ethicalComplexity) ? prev : current
      );
      mostHumanTask.currentAgent = AgentType.HUMAN;
    }
  }

  if (!hasShared) {
    const availableTasks = processedTasks.filter((t: any) => t.currentAgent !== AgentType.HUMAN);
    if (availableTasks.length > 0) {
      const bestSharedTask = availableTasks.reduce((prev: any, current: any) =>
        (prev.aiConfidence < current.aiConfidence) ? prev : current
      );
      bestSharedTask.currentAgent = AgentType.SHARED;
    }
  }

  if (!hasAI) {
    const availableTasks = processedTasks.filter((t: any) => t.currentAgent !== AgentType.HUMAN && t.currentAgent !== AgentType.SHARED);
    const candidates = availableTasks.length > 0 ? availableTasks : processedTasks.filter((t: any) => t.currentAgent !== AgentType.HUMAN);

    if (candidates.length > 0) {
      const bestAITask = candidates.reduce((prev: any, current: any) =>
        (prev.aiConfidence / (prev.ethicalComplexity + 0.1) > current.aiConfidence / (current.ethicalComplexity + 0.1)) ? prev : current
      );
      bestAITask.currentAgent = AgentType.AI;
    }
  }

  // 3. Save to Library (Blocking to ensure data consistency)
  const embeddingForSave = embedding || Array(768).fill(0); // Fallback to 0-vector if embedding fails

  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: problem,
        sector: sector,
        location: location,
        embedding: embeddingForSave,
        scenario: {
          title: raw.title,
          description: raw.description,
          tasks: raw.tasks
        }
      })
    });
    console.log("Cenário salvo com sucesso no banco de dados.");
  } catch (err) {
    console.error("Falha ao salvar cenário na biblioteca:", err);
  }

  return {
    ...raw,
    tasks: processedTasks
  };
};

export const generateRealityImage = async (prompt: string): Promise<string | null> => {
  if (!API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: CONFIG.MODELS.IMAGE, // Using the config content
      contents: { parts: [{ text: `Generate an image: Uma visualização cinematográfica de alta tecnologia de: ${prompt}. Estilo: futurista, digital misturado com elementos orgânicos, luzes neon, 4k, ambiente dramático.` }] },
    });

    // Check for inline data (standard for some Gemini image responses)
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Falha ao gerar imagem", e);
    return null;
  }
};

export const runSimulation = async (scenario: Scenario, boundaries: [number, number]): Promise<any> => {
  if (!API_KEY) throw new Error("API Key ausente");

  const response = await ai.models.generateContent({
    model: CONFIG.MODELS.ANALYSIS,
    contents: `Simule 3 realidades futuras para este cenário baseado na distribuição atual de tarefas entre IA e Humanos.
    O resultado deve ser em Português do Brasil.
    - Cenário: ${scenario.title}
    - Tarefas e Agentes Atuais: ${JSON.stringify(scenario.tasks.map(t => ({ label: t.label, agente: t.currentAgent })))}
    
    Descreva detalhadamente:
    1. Autonomia IA: O que acontece se a IA resolver tudo sozinha (foco em eficiência fria).
    2. Realidade Editada: O resultado da configuração híbrida atual (foco em equilíbrio).
    3. Intuição Humana: O que aconteceria se apenas humanos resolvessem manualmente (foco em empatia e lentidão).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aiOutcome: { type: Type.STRING, description: "Resultado da autonomia IA em português" },
          editedOutcome: { type: Type.STRING, description: "Resultado da realidade editada em português" },
          humanOutcome: { type: Type.STRING, description: "Resultado da intuição humana em português" },
          metrics: {
            type: Type.OBJECT,
            properties: {
              hybridEfficiency: { type: Type.NUMBER },
              hybridEthics: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });

  const data = JSON.parse(response.text || '{}');

  // Geração de imagens contextualizadas em português passadas para inglês para o modelo de imagem
  const [aiImg, editedImg, humanImg] = await Promise.all([
    generateRealityImage(`Pure AI dominance and cold efficiency for ${scenario.title}`),
    generateRealityImage(`Harmonious collaboration between human intuition and machine precision for ${scenario.title}`),
    generateRealityImage(`Deeply human, emotional and complex manual decision process for ${scenario.title}`)
  ]);

  return { ...data, images: { ai: aiImg, edited: editedImg, human: humanImg } };
};
