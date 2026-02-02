
import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import D3Graph from './D3Graph';
import { Cpu, Heart, GitMerge, Play, Share2 } from 'lucide-react';

const RealityEditor: React.FC = () => {
  const { currentScenario, boundaries, updateBoundaries, setAppState } = useStore();

  const handleDrag = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const parent = (e.currentTarget.parentNode as HTMLElement).getBoundingClientRect();

    // Disable selection during drag
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const pos = ((moveEvent.clientX - parent.left) / parent.width) * 100;
      const newBoundaries: [number, number] = [boundaries[0], boundaries[1]];
      newBoundaries[idx] = Math.max(10, Math.min(90, pos));

      if (idx === 0 && newBoundaries[0] > boundaries[1] - 10) newBoundaries[0] = boundaries[1] - 10;
      if (idx === 1 && newBoundaries[1] < boundaries[0] + 10) newBoundaries[1] = boundaries[0] + 10;

      updateBoundaries(newBoundaries);
    };

    const onMouseUp = () => {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleExportVector = () => {
    // Export logic can be adapted later if needed, for now keeping placeholder or removing
    alert("Exportação de mapa vetorial em manutenção para o novo layout.");
  };

  const aiTasks = currentScenario?.tasks.filter(t => t.currentAgent === 'AI') || [];
  const sharedTasks = currentScenario?.tasks.filter(t => t.currentAgent === 'SHARED') || [];
  const humanTasks = currentScenario?.tasks.filter(t => t.currentAgent === 'HUMAN') || [];

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden font-sans">
      {/* Nav Superior */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black/80 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white text-black rounded-lg font-bold text-xs font-mono">MFD.v1</div>
          <h2 className="font-space font-bold text-white text-lg tracking-tight">
            {currentScenario?.title || 'Análise de Sistema'}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
            <div className="px-4 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Fronteira: {Math.round(boundaries[0])}% | {Math.round(boundaries[1])}%
            </div>
          </div>
          <button
            onClick={() => setAppState('SIMULATION')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Simular Integração</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative flex w-full overflow-hidden">

        {/* Column 1: AI */}
        <div
          className="absolute top-0 bottom-0 left-0 overflow-hidden flex flex-col pt-16"
          style={{ width: `${boundaries[0]}%` }}
        >
          <div className="absolute inset-0 bg-territory-ai opacity-50 z-0" />
          <div className="relative z-10 flex flex-col h-full px-4 pb-4">
            <div className="text-blue-400 font-mono text-xs flex items-center justify-center gap-2 mb-6 uppercase tracking-widest font-bold">
              <Cpu className="w-4 h-4" /> Autonomia de Máquina
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {aiTasks.map(task => (
                <TaskCard key={task.id} task={task} color="blue" />
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-blue-500/20" />
        </div>

        {/* Column 2: Shared */}
        <div
          className="absolute top-0 bottom-0 overflow-hidden flex flex-col pt-16"
          style={{
            left: `${boundaries[0]}%`,
            width: `${boundaries[1] - boundaries[0]}%`
          }}
        >
          <div className="absolute inset-0 bg-territory-shared opacity-50 z-0" />
          <div className="relative z-10 flex flex-col h-full px-4 pb-4">
            <div className="text-purple-400 font-mono text-xs flex items-center justify-center gap-2 mb-6 uppercase tracking-widest font-bold">
              <GitMerge className="w-4 h-4" /> Malha Colaborativa
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {sharedTasks.map(task => (
                <TaskCard key={task.id} task={task} color="purple" />
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-purple-500/20" />
        </div>

        {/* Column 3: Human */}
        <div
          className="absolute top-0 bottom-0 right-0 overflow-hidden flex flex-col pt-16"
          style={{
            left: `${boundaries[1]}%`,
            width: `${100 - boundaries[1]}%`
          }}
        >
          <div className="absolute inset-0 bg-territory-human opacity-50 z-0" />
          <div className="relative z-10 flex flex-col h-full px-4 pb-4">
            <div className="text-amber-400 font-mono text-xs flex items-center justify-center gap-2 mb-6 uppercase tracking-widest font-bold">
              <Heart className="w-4 h-4" /> Discernimento Humano
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {humanTasks.map(task => (
                <TaskCard key={task.id} task={task} color="amber" />
              ))}
            </div>
          </div>
        </div>

        {/* Draggers de Fronteira */}
        <div
          className="absolute h-full z-30 flex items-center group cursor-ew-resize -translate-x-1/2"
          style={{ left: `${boundaries[0]}%` }}
          onMouseDown={(e) => handleDrag(0, e)}
        >
          <div className="w-1 h-full hover:bg-blue-500/50 transition-colors" /> {/* Hit area */}
          <div className="absolute top-1/2 -translate-y-1/2 bg-black border border-blue-500 p-1.5 rounded-full text-white shadow-[0_0_15px_#0066ff] cursor-grab active:cursor-grabbing transform hover:scale-110 transition-transform">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
          </div>
        </div>

        <div
          className="absolute h-full z-30 flex items-center group cursor-ew-resize -translate-x-1/2"
          style={{ left: `${boundaries[1]}%` }}
          onMouseDown={(e) => handleDrag(1, e)}
        >
          <div className="w-1 h-full hover:bg-amber-500/50 transition-colors" /> {/* Hit area */}
          <div className="absolute top-1/2 -translate-y-1/2 bg-black border border-amber-500 p-1.5 rounded-full text-white shadow-[0_0_15px_#ff9500] cursor-grab active:cursor-grabbing transform hover:scale-110 transition-transform">
            <div className="w-1 h-3 bg-amber-500 rounded-full" />
          </div>
        </div>

      </div>

      <footer className="bg-zinc-950 border-t border-zinc-900 relative z-50 shrink-0">
        {/* Metrics Bar */}
        <div className="grid grid-cols-4 divide-x divide-zinc-900 border-b border-zinc-900">
          {/* Total Stats */}
          <div className="p-4 flex flex-col justify-center items-center bg-zinc-900/10">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">Total de Nós</span>
            <div className="text-3xl font-space font-bold text-white">
              {currentScenario?.tasks.length || 0}
            </div>
          </div>

          {/* AI Stats */}
          <div className="p-4 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-900/5 group-hover:bg-blue-900/10 transition-colors" />
            <div className="relative z-10 flex justify-between items-end mb-2">
              <span className="text-blue-400 text-[10px] font-mono uppercase tracking-wider font-bold">Autonomia</span>
              <span className="text-2xl font-space font-bold text-blue-200">
                {Math.round((aiTasks.length / (currentScenario?.tasks.length || 1)) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(aiTasks.length / (currentScenario?.tasks.length || 1)) * 100}%` }}
                className="h-full bg-blue-500 shadow-[0_0_10px_#0066ff]"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 font-mono text-right">{aiTasks.length} ações</div>
          </div>

          {/* Shared Stats */}
          <div className="p-4 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-900/5 group-hover:bg-purple-900/10 transition-colors" />
            <div className="relative z-10 flex justify-between items-end mb-2">
              <span className="text-purple-400 text-[10px] font-mono uppercase tracking-wider font-bold">Colaboração</span>
              <span className="text-2xl font-space font-bold text-purple-200">
                {Math.round((sharedTasks.length / (currentScenario?.tasks.length || 1)) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(sharedTasks.length / (currentScenario?.tasks.length || 1)) * 100}%` }}
                className="h-full bg-purple-500 shadow-[0_0_10px_#bf5af2]"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 font-mono text-right">{sharedTasks.length} ações</div>
          </div>

          {/* Human Stats */}
          <div className="p-4 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-900/5 group-hover:bg-amber-900/10 transition-colors" />
            <div className="relative z-10 flex justify-between items-end mb-2">
              <span className="text-amber-400 text-[10px] font-mono uppercase tracking-wider font-bold">Humano</span>
              <span className="text-2xl font-space font-bold text-amber-200">
                {Math.round((humanTasks.length / (currentScenario?.tasks.length || 1)) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(humanTasks.length / (currentScenario?.tasks.length || 1)) * 100}%` }}
                className="h-full bg-amber-500 shadow-[0_0_10px_#ff9500]"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 font-mono text-right">{humanTasks.length} ações</div>
          </div>
        </div>

        <div className="px-6 py-2 flex justify-between items-center bg-zinc-950">
          <div className="flex gap-4 text-[10px] font-mono text-zinc-600">
            <span>STATUS: SISTEMA MAPEAR V1.0</span>
            <span>DADOS: PROCESSADOS EM TEMPO REAL</span>
          </div>

          <button
            onClick={handleExportVector}
            className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors uppercase font-bold text-xs py-2"
          >
            <Share2 className="w-4 h-4" /> Exportar Relatório Completo
          </button>
        </div>
      </footer>
    </div>
  );
};

const TaskCard: React.FC<{ task: any, color: 'blue' | 'purple' | 'amber' }> = ({ task, color }) => {
  const borderColors = {
    blue: 'border-blue-500/30 hover:border-blue-500',
    purple: 'border-purple-500/30 hover:border-purple-500',
    amber: 'border-amber-500/30 hover:border-amber-500'
  };

  const bgColors = {
    blue: 'bg-blue-950/40',
    purple: 'bg-purple-950/40',
    amber: 'bg-amber-950/40'
  };

  const textColors = {
    blue: 'text-blue-100',
    purple: 'text-purple-100',
    amber: 'text-amber-100'
  }

  const numberColors = {
    blue: 'text-blue-500/50 group-hover:text-blue-400',
    purple: 'text-purple-500/50 group-hover:text-purple-400',
    amber: 'text-amber-500/50 group-hover:text-amber-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-5 rounded-xl border ${borderColors[color]} ${bgColors[color]} 
        backdrop-blur-md transition-all duration-300 group
        cursor-default hover:shadow-2xl hover:-translate-y-1
      `}
    >
      <div className={`absolute top-2 right-4 text-4xl font-space font-bold ${numberColors[color]} transition-colors opacity-30 select-none`}>
        {task.id}
      </div>

      <div className="relative z-10 pr-8">
        <h4 className={`text-lg font-bold leading-tight mb-3 font-space ${textColors[color]} lowercase`}>
          {task.label}
        </h4>

        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light opacity-90 border-t border-white/10 pt-3">
          {task.description}
        </p>
      </div>
    </motion.div>
  );
};

export default RealityEditor;
