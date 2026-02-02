
import { create } from 'zustand';
import { AppState, Scenario, AgentType, TaskNode } from './types';

interface CREStore {
  appState: AppState;
  currentScenario: Scenario | null;
  boundaries: [number, number]; // Percentage positions [AI-Shared, Shared-Human]
  setAppState: (state: AppState) => void;
  setScenario: (scenario: Scenario) => void;
  updateBoundaries: (boundaries: [number, number]) => void;
  updateNodeAgent: (id: string, agent: AgentType) => void;
}

export const useStore = create<CREStore>((set) => ({
  appState: 'DASHBOARD',
  currentScenario: null,
  boundaries: [33, 66],
  setAppState: (state) => set({ appState: state }),
  setScenario: (scenario) => set({ currentScenario: scenario }),
  updateBoundaries: (boundaries) => set({ boundaries }),
  updateNodeAgent: (id, agent) => set((state) => {
    if (!state.currentScenario) return state;
    const newTasks = state.currentScenario.tasks.map(t =>
      t.id === id ? { ...t, currentAgent: agent } : t
    );
    return { currentScenario: { ...state.currentScenario, tasks: newTasks } };
  }),
}));
