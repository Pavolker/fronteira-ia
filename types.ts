
export enum AgentType {
  AI = 'AI',
  HUMAN = 'HUMAN',
  SHARED = 'SHARED'
}

export interface TaskNode {
  id: string;
  label: string;
  description: string;
  aiConfidence: number; // 0-1
  ethicalComplexity: number; // 0-1
  currentAgent: AgentType;
  x?: number;
  y?: number;
  dependencies?: string[];
}

export interface Scenario {
  title: string;
  description: string;
  tasks: TaskNode[];
}

export interface SimulationResult {
  panel: 'AI' | 'Edited' | 'Human';
  outcome: string;
  efficiency: number;
  ethics: number;
  speed: string;
}

export type AppState = 'DASHBOARD' | 'PORTAL' | 'EDITOR' | 'SIMULATION';
