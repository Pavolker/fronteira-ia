
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { Database, TrendingUp, GitMerge, Brain, Users, Activity, Play, ChevronLeft, ChevronRight, Globe, Layout, FileText, Building2 } from 'lucide-react';

interface DashboardStats {
    total_mapped: number;
    total_simulations: number;
    ai_autonomy_index: number;
    human_dependency_index: number;
    hybrid_synergy_rate: number;
    recent_scenarios: { title: string, created_at: string }[];
    sectors: { name: string, value: number }[];
    locations: { name: string, value: number }[];
    top_problems: { name: string, count: number }[];
}

const Dashboard: React.FC = () => {
    const { setAppState } = useStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        // Fetch stats from backend
        fetch(`${import.meta.env.VITE_API_URL}/api/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch dashboard stats", err));
    }, []);

    // Variant for staggered animations
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const [activeInfo, setActiveInfo] = useState<keyof typeof infoContent | null>(null);

    const infoContent = {
        WHAT: {
            title: "O que é o Mapa?",
            icon: <Brain className="w-12 h-12 text-blue-400 mb-4" />,
            text: (
                <div className="space-y-4 text-zinc-300">
                    <p>O <strong>Mapa de Fronteiras de Decisão</strong> é uma plataforma de inteligência híbrida projetada para "desembaraçar" processos de decisão complexos.</p>
                    <p>Ao contrário de ferramentas comuns de IA, ele não tenta decidir tudo por você. Em vez disso, ele mapeia a <strong>"fronteira"</strong> exata onde a automação deve parar e a intuição humana deve assumir.</p>
                    <p>É um GPS para navegar na era da Inteligência Artificial sem perder a humanidade.</p>
                </div>
            )
        },
        WHY: {
            title: "Para que serve?",
            icon: <Activity className="w-12 h-12 text-amber-400 mb-4" />,
            text: (
                <div className="space-y-4 text-zinc-300">
                    <p>Serve para dissolver a ambiguidade em cenários corporativos de alto risco. Use quando:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>A decisão envolve dilemas éticos ou morais.</li>
                        <li>O volume de dados é grande demais para um humano, mas o contexto é sutil demais para uma máquina.</li>
                        <li>Você precisa justificar racionalmente por que automatizou (ou não) um processo.</li>
                    </ul>
                </div>
            )
        },
        HOW: {
            title: "Como usar?",
            icon: <Play className="w-12 h-12 text-emerald-400 mb-4" />,
            text: (
                <div className="space-y-4 text-zinc-300">
                    <ol className="list-decimal pl-5 space-y-3">
                        <li>Clique no botão <strong>"Mapear Novo Desafio"</strong> no centro da tela.</li>
                        <li>Descreva seu problema (Ex: "Devo usar IA para demissões em massa?").</li>
                        <li>O sistema analisará o caso e quebrará em <strong>micro-tarefas</strong>.</li>
                        <li>Você assume o papel de Arquiteto, ajustando quem faz o quê (IA, Humano ou Centauro).</li>
                        <li>Por fim, simule os futuros possíveis dessa configuração.</li>
                    </ol>
                </div>
            )
        },
        BENEFITS: {
            title: "O que você ganha?",
            icon: <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />,
            text: (
                <div className="space-y-4 text-zinc-300">
                    <p><strong className="text-white">Segurança Jurídica/Ética:</strong> Cria um registro auditável de que humanos supervisionaram as partes críticas.</p>
                    <p><strong className="text-white">Eficiência Sem Risco:</strong> Automatiza o trivial (80% do tempo) para você focar no estratégico (20% que importa).</p>
                    <p><strong className="text-white">Clareza Mental:</strong> Remove a "paralisia por análise" ao visualizar o problema dissecado.</p>
                </div>
            )
        }
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-black flex overflow-hidden font-sans text-white relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,50,0.2),rgba(0,0,0,1))]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-20" />

            {/* Info Modal Overlay */}
            {activeInfo && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setActiveInfo(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActiveInfo(null)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <div className="flex flex-col items-center text-center">
                            {infoContent[activeInfo].icon}
                            <h2 className="text-2xl font-space font-bold mb-6 text-white">{infoContent[activeInfo].title}</h2>
                            <div className="text-left bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50 w-full">
                                {infoContent[activeInfo].text}
                            </div>
                            <button
                                onClick={() => setActiveInfo(null)}
                                className="mt-8 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-mono uppercase tracking-widest transition-colors"
                            >
                                Entendi
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Collapsible Sidebar */}
            <motion.div
                initial={{ width: 60 }}
                animate={{ width: isSidebarOpen ? 240 : 60 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative z-20 h-full border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex flex-col"
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-10 bg-zinc-800 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-white transition-colors z-30"
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Sidebar Content */}
                <div className="flex-1 py-8 flex flex-col gap-4 overflow-hidden">
                    <div className={`px-4 mb-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Início Rápido</p>
                    </div>

                    <SidebarBtn
                        isOpen={isSidebarOpen}
                        onClick={() => setActiveInfo('WHAT')}
                        icon={<Brain className="w-5 h-5 text-blue-400" />}
                        label="O que é?"
                        active={activeInfo === 'WHAT'}
                    />
                    <SidebarBtn
                        isOpen={isSidebarOpen}
                        onClick={() => setActiveInfo('WHY')}
                        icon={<Activity className="w-5 h-5 text-amber-400" />}
                        label="Para que serve?"
                        active={activeInfo === 'WHY'}
                    />
                    <SidebarBtn
                        isOpen={isSidebarOpen}
                        onClick={() => setActiveInfo('HOW')}
                        icon={<Play className="w-5 h-5 text-emerald-400" />}
                        label="Como usar?"
                        active={activeInfo === 'HOW'}
                    />
                    <SidebarBtn
                        isOpen={isSidebarOpen}
                        onClick={() => setActiveInfo('BENEFITS')}
                        icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                        label="Benefícios"
                        active={activeInfo === 'BENEFITS'}
                    />

                    <div className={`mt-8 px-4 mb-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Links</p>
                    </div>

                    <SidebarLink
                        isOpen={isSidebarOpen}
                        href="https://mdh-hability.com"
                        icon={<Globe className="w-5 h-5 text-zinc-600 group-hover:text-white" />}
                        label="MDH Hability"
                    />
                    <SidebarLink
                        isOpen={isSidebarOpen}
                        href="https://centauro-ia.netlify.app"
                        icon={<Layout className="w-5 h-5 text-zinc-600 group-hover:text-white" />}
                        label="Sistema Centauro"
                    />
                    <SidebarLink
                        isOpen={isSidebarOpen}
                        href="https://raw.githubusercontent.com/Pavolker/ebook-fronteira/2e38a1f44b39dbc367a7d61792604d40a9b2520e/fronteiras.pdf"
                        icon={<FileText className="w-5 h-5 text-zinc-600 group-hover:text-white" />}
                        label="Artigo Fronteira"
                    />
                </div>

                {/* Visual Footer/Decoration in Sidebar */}
                <div className={`p-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="h-px bg-zinc-800 mb-4" />
                    <p className="text-[10px] text-zinc-600 font-mono text-center">
                        GUIA DO USUÁRIO
                    </p>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="relative z-10 p-8 flex justify-between items-center border-b border-zinc-900/50 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <img src="/centauro.gif" alt="Centauro" className="h-16 w-auto object-contain" />
                        <div>
                            <h1 className="text-4xl md:text-5xl font-space font-bold tracking-tighter text-white mb-2">
                                Mapa de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Fronteiras de Decisão</span>
                            </h1>
                            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
                                Inteligência Humano-IA na Solução de Problemas Corporativos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">Database Online</span>
                        </div>
                        <img src="/mdh.gif" alt="MDH" className="h-16 w-auto object-contain" />
                    </div>
                </header>

                {/* Main Dashboard Content */}
                <main className="relative z-10 flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="max-w-7xl mx-auto space-y-8"
                    >

                        {/* Top Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard
                                title="Empresas Atendidas"
                                value={stats?.total_mapped || 0}
                                icon={<Building2 className="w-5 h-5 text-blue-400" />}
                                sub="Base de Clientes"
                            />
                            <StatCard
                                title="Autonomia IA"
                                value={`${Math.round((stats?.ai_autonomy_index || 0) * 100)}%`}
                                icon={<Brain className="w-5 h-5 text-purple-400" />}
                                sub="Índice Global"
                            />
                            <StatCard
                                title="Intuição Humana"
                                value={`${Math.round((stats?.human_dependency_index || 0) * 100)}%`}
                                icon={<Users className="w-5 h-5 text-amber-400" />}
                                sub="Dependência Estratégica"
                            />
                            <StatCard
                                title="Sinergia Híbrida"
                                value={`${Math.round((stats?.hybrid_synergy_rate || 0) * 100)}%`}
                                icon={<GitMerge className="w-5 h-5 text-emerald-400" />}
                                sub="Eficiência Combinada"
                            />
                        </div>

                        {/* Stats Detail Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sector Distribution */}
                            <motion.div variants={item} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                                <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Setores da Economia
                                </h3>
                                <div className="space-y-3">
                                    {stats?.sectors?.map((s, i) => (
                                        <div key={i} className="group">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-300">{s.name}</span>
                                                <span className="text-zinc-500 font-mono">{s.value}%</span>
                                            </div>
                                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${s.value}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className="h-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Geographic Distribution */}
                            <motion.div variants={item} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                                <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Database className="w-4 h-4 text-blue-400" /> Localização
                                </h3>
                                <div className="space-y-3">
                                    {stats?.locations?.map((l, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-xs text-zinc-300">{l.name}</span>
                                            </div>
                                            <span className="text-xs font-mono text-zinc-500">{l.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Top Problems */}
                            <motion.div variants={item} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                                <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-amber-400" /> Top 5 Problemas Recorrentes
                                </h3>
                                <div className="space-y-3">
                                    {stats?.top_problems?.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="text-[10px] font-mono text-zinc-600 w-4">0{i + 1}</div>
                                            <div className="flex-1">
                                                <div className="text-xs text-zinc-300 mb-1">{p.name}</div>
                                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(p.count / 20) * 100}%` }} // Normalizing roughly
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className="h-full bg-amber-500/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-500">{p.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Central Visual Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">

                            {/* Recent Activity Feed */}
                            <motion.div variants={item} className="lg:col-span-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Atividade Recente
                                    </h3>
                                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {stats?.recent_scenarios?.map((s, i) => (
                                            <div key={i} className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                                                <div className="text-sm text-zinc-300 font-medium truncate mb-1">{s.title || "Cenário Sem Título"}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono">{new Date(s.created_at).toLocaleDateString()}</div>
                                            </div>
                                        )) || <div className="text-zinc-600 italic text-sm">Nenhum cenário recente.</div>}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Call to Action - The "Map" Area */}
                            <motion.div variants={item} className="lg:col-span-2 bg-gradient-to-br from-blue-950/20 to-purple-950/20 border border-white/5 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden text-left">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                <div className="absolute inset-0 bg-blue-500/5 pulse-slow" />

                                <div className="relative z-10 max-w-2xl">
                                    <h2 className="text-xl font-space font-bold text-blue-200 mb-4 tracking-wide uppercase">O que é o Mapa de Fronteiras de Decisão?</h2>

                                    <div className="space-y-4 text-zinc-300 text-sm leading-relaxed mb-8 font-light">
                                        <p>
                                            O <strong className="text-white">Mapa de Fronteiras de Decisão</strong> é um aplicativo que ajuda a definir, de forma clara e consciente,
                                            quando a decisão deve ser humana, quando pode ser automatizada e quando precisa ser compartilhada
                                            entre pessoas e Inteligência Artificial.
                                        </p>
                                        <p>
                                            Ele funciona como um <strong className="text-white">simulador de decisão</strong>, permitindo visualizar limites, responsabilidades
                                            e pontos de transição antes que a IA seja colocada para decidir de verdade.
                                        </p>
                                        <p>
                                            Em vez de delegar decisões de forma implícita ou confusa, o mapa torna explícito
                                            <em className="text-zinc-100 not-italic"> quem decide o quê</em>, em que condições e com qual responsabilidade.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setAppState('PORTAL')}
                                        className="group px-8 py-4 bg-white text-black rounded-full font-bold font-space uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Mapear Novo Desafio
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="p-6 border-t border-zinc-900 text-center relative z-10">
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
                        Copywriter - 2026 - MDH - Versão 1.0 - Desenvolvido por Pvolker
                    </p>
                </footer>

            </div>
        </div>
    );
};

// Sub-component for interactive sidebar buttons
const SidebarBtn: React.FC<{ isOpen: boolean; onClick: () => void; icon: React.ReactNode; label: string; active: boolean }> = ({ isOpen, onClick, icon, label, active }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3 text-left w-full transition-colors border-l-2 ${active ? 'bg-zinc-900 text-white border-blue-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent hover:border-blue-500'} whitespace-nowrap group`}
    >
        <div className="min-w-[20px] relative">
            {icon}
            {active && <motion.div layoutId="activeGlow" className="absolute inset-0 bg-blue-500 blur-lg opacity-50" />}
        </div>
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            className={`font-mono text-xs uppercase tracking-wider ${isOpen ? 'block' : 'hidden'}`}
        >
            {label}
        </motion.span>
    </button>
);

// Sub-component for sidebar links
const SidebarLink: React.FC<{ isOpen: boolean; href: string; icon: React.ReactNode; label: string }> = ({ isOpen, href, icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 px-4 py-3 text-zinc-600 hover:text-white hover:bg-zinc-900 transition-colors border-l-2 border-transparent hover:border-zinc-700 whitespace-nowrap group"
    >
        <div className="min-w-[20px]">{icon}</div>
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            className={`font-mono text-[10px] uppercase tracking-wider ${isOpen ? 'block' : 'hidden'}`}
        >
            {label}
        </motion.span>
    </a>
);

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, sub: string }> = ({ title, value, icon, sub }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group backdrop-blur-sm"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150 transform translate-x-2 -translate-y-2">
            {icon}
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-zinc-400 font-mono text-xs uppercase tracking-wider">
                {icon}
                <span>{title}</span>
            </div>
            <div className="text-4xl font-space font-bold text-white mb-2">{value}</div>
            <div className="text-[10px] text-zinc-600 font-mono uppercase">{sub}</div>
        </div>
    </motion.div>
);

export default Dashboard;
