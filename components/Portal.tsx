
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { analyzeProblem } from '../geminiService';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';

const Portal: React.FC = () => {
  const [input, setInput] = useState('');
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { setScenario, setAppState } = useStore();

  const handleAnalyze = async () => {
    if (!input.trim() || !sector.trim() || !location.trim()) return;
    setLoading(true);
    try {
      const scenario = await analyzeProblem(input, sector, location);
      setScenario(scenario);
      setAppState('EDITOR');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Gradients Decorativos */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-6xl text-center space-y-8"
      >
        <header className="flex flex-col md:flex-row items-center justify-between gap-8">
          <img src="/centauro.gif" alt="Centauro" className="h-20 w-auto object-contain" />

          <div className="space-y-2 flex-1">
            <h1 className="text-5xl md:text-7xl font-space font-bold tracking-tighter text-white leading-tight">
              Mapa de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Fronteiras de Decisão</span> <br className="hidden md:block" />- Humano x IA
            </h1>
            <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">
              Fronterias de Competências Humano - IA na Solução de Problemas Corporativos
            </p>
          </div>

          <img src="/mdh.gif" alt="MDH" className="h-20 w-auto object-contain" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Setor da Economia (ex: Varejo, Saúde, Finanças)"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all font-sans"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Localização (ex: São Paulo, Remoto, Fabrica A)"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all font-sans"
          />
        </div>

        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva um desafio complexo... (ex: 'Reduzir erros de diagnóstico médico em áreas rurais usando dados locais')"
            className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none font-serif"
          />
          {loading && <div className="scan-line top-0" />}

          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim() || !sector.trim() || !location.trim()}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Iniciar Análise</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        <div className="flex justify-center gap-12 pt-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_#0066ff]" />
            <span className="text-xs font-mono text-zinc-500 uppercase">Capacidade IA</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#bf5af2]" />
            <span className="text-xs font-mono text-zinc-500 uppercase">Sinergia Híbrida</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1 bg-amber-500 rounded-full shadow-[0_0_10px_#ff9500]" />
            <span className="text-xs font-mono text-zinc-500 uppercase">Contexto Humano</span>
          </div>
        </div>

        <footer className="mt-12 text-center relative z-10 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
            Copywriter - 2026 - MDH - Versão 1.0 - Desenvolvido por Pvolker
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Portal;
