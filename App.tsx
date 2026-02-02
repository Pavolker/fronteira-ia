
import React from 'react';
import { useStore } from './store';
import Portal from './components/Portal';
import RealityEditor from './components/RealityEditor';
import SimulationView from './components/SimulationView';
import { AnimatePresence, motion } from 'framer-motion';

import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const { appState } = useStore();

  return (
    <div className="antialiased select-none">
      <AnimatePresence mode="wait">
        {appState === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
          >
            <Dashboard />
          </motion.div>
        )}

        {appState === 'PORTAL' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
          >
            <Portal />
          </motion.div>
        )}

        {appState === 'EDITOR' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-screen w-full"
          >
            <RealityEditor />
          </motion.div>
        )}

        {appState === 'SIMULATION' && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="h-screen w-full"
          >
            <SimulationView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elementos UI Globais Persistentes */}
      <div className="fixed bottom-4 left-4 z-50 flex gap-2 pointer-events-none">
        <div className="px-3 py-1 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
          Conexão Segura: Estabelecida
        </div>
        <div className="px-3 py-1 bg-emerald-900/20 backdrop-blur border border-emerald-500/20 rounded-full text-[8px] font-mono text-emerald-500 flex items-center gap-2 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Núcleo Online
        </div>
      </div>
    </div>
  );
};

export default App;
