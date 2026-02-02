
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { runSimulation } from '../geminiService';
import { Loader2, ArrowLeft, Zap, ShieldCheck, Timer } from 'lucide-react';


const SimulationView: React.FC = () => {
  const { currentScenario, boundaries, setAppState } = useStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState("Mapeando estados quânticos...");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const messages = [
      "Colapsando funções de onda...",
      "Gerando realidades paralelas...",
      "Sintetizando quadros de realidade...",
      "Calculando convergência ética...",
      "Finalizando prova de arquitetura..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 2500);

    const fetchSimulation = async () => {
      if (!currentScenario) return;
      hasFetched.current = true;
      try {
        const res = await runSimulation(currentScenario, boundaries);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimulation();
    return () => clearInterval(interval);
  }, [currentScenario, boundaries]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center space-y-10">
        <div className="relative">
          <Loader2 className="w-20 h-20 text-purple-500 animate-spin opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-6 bg-white rounded-full shadow-[0_0_20px_#fff]"
            />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-space font-bold text-white tracking-[0.2em] uppercase">Simulando Realidades</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] animate-pulse">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <header className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl z-20 flex-none">
        <button
          onClick={() => setAppState('EDITOR')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all font-mono text-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RECONFIGURAR ARQUITETURA</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-space font-bold text-white uppercase tracking-widest">Análise Comparativa de Resultados</h2>
          <p className="text-[10px] text-zinc-500 font-mono italic">Matriz de Configuração: {boundaries[0].toFixed(1)}% / {boundaries[1].toFixed(1)}%</p>
        </div>
        <div className="flex gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#0066ff]" />
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_#bf5af2]" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#ff9500]" />
        </div>
      </header>

      <main className="flex-1 flex divide-x divide-zinc-900 bg-[#020202] overflow-hidden">
        {/* Autonomia IA */}
        <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-blue-900/5 group-hover:bg-blue-900/10 transition-colors pointer-events-none" />

          <div className="flex-none flex items-center justify-between border-b border-blue-500/20 pb-4">
            <div className="flex items-center gap-3 text-blue-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4" />
              <span>Autonomia IA</span>
            </div>
            <div className="px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20 text-[10px] text-blue-300 font-mono">
              EFICIÊNCIA MÁXIMA
            </div>
          </div>

          {/* Data Dashboard AI */}
          <div className="grid grid-cols-2 gap-3">
            <DataCard label="Velocidade" value="99.9%" sub="Processamento Instantâneo" color="blue" />
            <DataCard label="Custo" value="$0.001" sub="Por Transação" color="blue" />
            <DataCard label="Precisão" value="High" sub="Baseada em Dados" color="blue" />
            <DataCard label="Empatia" value="0%" sub="Não Aplicável" color="blue" opacity={true} />
          </div>

          <div className="flex-1 bg-zinc-900/40 border border-blue-900/10 rounded-2xl p-6 font-mono text-sm text-zinc-400 overflow-y-auto leading-relaxed scrollbar-hide backdrop-blur-sm">
            {results?.aiOutcome}
          </div>
        </div>

        {/* Realidade Editada */}
        <div className="flex-[1.3] flex flex-col bg-purple-950/[0.05] p-6 space-y-4 border-x-2 border-purple-500/10 overflow-hidden relative">

          <div className="flex-none flex items-center justify-between border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-3 text-purple-400 font-mono text-sm font-bold uppercase tracking-[0.2em] relative z-10">
              <ShieldCheck className="w-5 h-5" />
              <span>Realidade Editada (Híbrida)</span>
            </div>
            <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-[10px] text-white font-bold font-mono shadow-[0_0_15px_#bf5af2]">
              SOLUÇÃO RECOMENDADA
            </div>
          </div>

          {/* Data Dashboard Hybrid - Hero Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-purple-300 uppercase tracking-widest mb-1">Sinergia</span>
              <span className="text-3xl font-space font-bold text-white shadow-purple-500 drop-shadow-lg">
                {Math.round((results?.metrics?.hybridEfficiency || 0.88) * 100)}%
              </span>
            </div>
            <div className="col-span-1 p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-purple-300 uppercase tracking-widest mb-1">Ética</span>
              <span className="text-3xl font-space font-bold text-white">
                {Math.round((results?.metrics?.hybridEthics || 0.94) * 100)}%
              </span>
            </div>
            <div className="col-span-1 p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-purple-300 uppercase tracking-widest mb-1">Resultado</span>
              <span className="text-xl font-space font-bold text-emerald-400">
                OTIMIZADO
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-zinc-900/30 border border-purple-500/10 rounded-2xl p-6 font-mono text-sm text-zinc-300 overflow-y-auto leading-relaxed scrollbar-hide backdrop-blur-md shadow-inner">
            {results?.editedOutcome}
          </div>
        </div>

        {/* Intuição Humana */}
        <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-amber-900/5 group-hover:bg-amber-900/10 transition-colors pointer-events-none" />

          <div className="flex-none flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Timer className="w-4 h-4" />
              <span>Intuição Humana</span>
            </div>
            <div className="px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 text-[10px] text-amber-300 font-mono">
              ALTA LATÊNCIA
            </div>
          </div>

          {/* Data Dashboard Human */}
          <div className="grid grid-cols-2 gap-3">
            <DataCard label="Velocidade" value="Manual" sub="Depende de Fatores" color="amber" />
            <DataCard label="Custo" value="Alto" sub="Horas/Homem" color="amber" />
            <DataCard label="Criatividade" value="Infinita" sub="Não Determinística" color="amber" />
            <DataCard label="Empatia" value="100%" sub="Fator Humano Puro" color="amber" />
          </div>

          <div className="flex-1 bg-zinc-900/40 border border-amber-900/10 rounded-2xl p-6 font-mono text-sm text-zinc-400 overflow-y-auto leading-relaxed scrollbar-hide backdrop-blur-sm">
            {results?.humanOutcome}
          </div>
        </div>
      </main>
    </div>
  );
};

const DataCard: React.FC<{ label: string, value: string, sub: string, color: 'blue' | 'purple' | 'amber', opacity?: boolean }> = ({ label, value, sub, color, opacity }) => {
  const textColors = {
    blue: 'text-blue-200',
    purple: 'text-purple-200',
    amber: 'text-amber-200'
  };
  const borderColors = {
    blue: 'border-blue-500/20',
    purple: 'border-purple-500/20',
    amber: 'border-amber-500/20'
  };
  const bgColors = {
    blue: 'bg-blue-950/20',
    purple: 'bg-purple-950/20',
    amber: 'bg-amber-950/20'
  };

  return (
    <div className={`p-3 rounded-lg border ${borderColors[color]} ${bgColors[color]} ${opacity ? 'opacity-50' : ''}`}>
      <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
      <div className={`text-lg font-space font-bold ${textColors[color]} leading-none mb-1`}>{value}</div>
      <div className="text-[9px] text-zinc-600 font-mono truncate">{sub}</div>
    </div>
  )
}

export default SimulationView;
