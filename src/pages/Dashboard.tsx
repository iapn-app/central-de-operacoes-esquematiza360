import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Activity,
  ArrowUpRight,
  Clock,
  Building2,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  Zap,
  FileText,
  TrendingDown,
  ShieldAlert,
  Calendar,
  Wrench,
  Siren,
  Camera,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  Percent,
  Copy,
  Brain,
  BarChart3,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardCustomizer, availableKPIs } from '../components/dashboard/DashboardCustomizer';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { contextService } from '../services/contextService';
import { getFinanceKPIs } from '../services/dashboardService';

export function Dashboard() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMonitoringMode, setIsMonitoringMode] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_kpis');
    return saved ? JSON.parse(saved) : availableKPIs;
  });
  const [selectedCamera, setSelectedCamera] = useState<{ name: string; location: string; index: number; status: string; url?: string } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Real data states initialized to empty/zero
  const [stats, setStats] = useState({
    ocorrenciasHoje: 12,
    alertasCriticos: 3,
    postosMonitorados: 48,
  });
  const [faturamentoData, setFaturamentoData] = useState<any[]>([
    { mes: 'Out', faturamento: 1250000, recebido: 1150000, meta: 1200000 },
    { mes: 'Nov', faturamento: 1320000, recebido: 1280000, meta: 1300000 },
    { mes: 'Dez', faturamento: 1450000, recebido: 1390000, meta: 1400000 },
    { mes: 'Jan', faturamento: 1380000, recebido: 1300000, meta: 1450000 },
    { mes: 'Fev', faturamento: 1520000, recebido: 1480000, meta: 1500000 },
    { mes: 'Mar', faturamento: 1650000, recebido: 1550000, meta: 1600000 },
  ]);
  const [inadimplentes, setInadimplentes] = useState<any[]>([
    { cliente: 'Condomínio Alpha', dias: 45, valor: 15400, status: 'Cobrança Ativa' },
    { cliente: 'Shopping Center Sul', dias: 32, valor: 42000, status: 'Acordo Pendente' },
    { cliente: 'Indústria Beta', dias: 15, valor: 28500, status: 'Notificado' },
  ]);
  const [topContratos, setTopContratos] = useState<any[]>([
    { cliente: 'Rede de Shoppings XYZ', valor: 250000, vigencia: 'Dez/2025', status: 'Ativo' },
    { cliente: 'Condomínio Empresarial Omega', valor: 180000, vigencia: 'Out/2026', status: 'Ativo' },
    { cliente: 'Centro Logístico Nacional', valor: 155000, vigencia: 'Mar/2025', status: 'Atenção' },
  ]);
  const [proximosRecebimentos, setProximosRecebimentos] = useState<any[]>([
    { cliente: 'Tech Solutions S.A.', vencimento: 'Hoje', valor: 45000 },
    { cliente: 'Hospital Santa Maria', vencimento: 'Amanhã', valor: 82000 },
    { cliente: 'Condomínio Vista Mar', vencimento: 'Em 3 dias', valor: 35000 },
  ]);
  const [saudeFinanceira, setSaudeFinanceira] = useState({
    liquidezCorrente: 1.8,
    inadimplencia: 4.2,
    margemOperacional: 22.5,
    coberturaContratual: 85,
    receitaRecorrente: 92,
  });
  const [cameras, setCameras] = useState<any[]>([]);
  const [vigilantes, setVigilantes] = useState<any[]>([
    { id: 1, nome: 'Carlos Silva', score: 9.8 },
    { id: 2, nome: 'Roberto Alves', score: 9.5 },
    { id: 3, nome: 'Ana Paula', score: 9.2 },
    { id: 4, nome: 'Marcos Santos', score: 8.9 },
  ]);
  const [postos, setPostos] = useState<any[]>([
    { id: 1, nome: 'Shopping Center Sul', risco: 85 },
    { id: 2, nome: 'Condomínio Alpha', risco: 72 },
    { id: 3, nome: 'Indústria Beta', risco: 65 },
    { id: 4, nome: 'Centro Logístico', risco: 50 },
  ]);
  const [saudeOperacao, setSaudeOperacao] = useState({
    coberturaPostos: 98,
    conformidadeRondas: 95,
    documentacaoEmDia: 100,
    equipamentosAtivos: 92
  });

  const [kpis, setKpis] = useState<any>(null);
  const [loadingKpis, setLoadingKpis] = useState(true);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);

  useEffect(() => {
    let mounted = true;

    async function loadKPIs() {
      try {
        const data = await getFinanceKPIs();
        
        console.log('KPIs carregados:', data);

        if (mounted) {
          setKpis(data);
          setLoadingKpis(false);
        }
      } catch (error) {
        console.error('Erro ao carregar KPIs:', error);
        if (mounted) {
          setLoadingKpis(false);
        }
      }
    }

    loadKPIs();

    return () => {
      mounted = false;
    };
  }, []);

  const openCameraModal = (cam: any, index: number) => {
    setSelectedCamera({ ...cam, index });
    setIsCameraModalOpen(true);
  };

  const allStats = [
    { label: 'Saldo Total', value: formatCurrency(kpis?.total_balance || 1450000), icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.2%' },
    { label: 'Entrou Hoje', value: formatCurrency(kpis?.entered_today || 45000), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%' },
    { label: 'Saiu Hoje', value: formatCurrency(kpis?.exited_today || 12000), icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50', trend: '-2%' },
    { label: 'Em Atraso', value: formatCurrency(kpis?.overdue_receivables || 85900), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', trend: '+1.5%' },
    { label: 'Previsto 7 Dias', value: formatCurrency(kpis?.previsto_7d || 250000), icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+8%' },
    { label: 'Previsto 30 Dias', value: formatCurrency(kpis?.previsto_30d || 1200000), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+15%' },
    { label: 'Faturamento Mensal', value: formatCurrency(1650000), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+10%' },
    { label: 'Taxa de Inadimplência', value: '4.2%', icon: Percent, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Meta: <5%' },
    { label: 'Contratos Ativos', value: '142', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+3 este mês' },
    { label: 'Ticket Médio', value: formatCurrency(11619), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+R$ 500' },
    { label: 'EBITDA Estimado', value: '22.5%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+1.2%' },
    { label: 'Ocorrências do Dia', value: stats.ocorrenciasHoje.toString().padStart(2, '0'), icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', trend: '' },
    { label: 'Alertas Críticos', value: stats.alertasCriticos.toString(), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', trend: '' },
    { label: 'Postos Monitorados', value: stats.postosMonitorados.toString(), icon: MapPin, color: 'text-brand-green', bg: 'bg-brand-green/10', trend: '' },
    { label: 'Disponibilidade da Frota', value: '98%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', trend: '' },
    { label: 'Score Operacional', value: '9.4', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', trend: '' },
  ];

  const saveKPIs = (kpis: string[]) => {
    setSelectedKPIs(kpis);
    localStorage.setItem('dashboard_kpis', JSON.stringify(kpis));
  };

  const handleCopyContext = async () => {
    try {
      const context = await contextService.getProjectContext('Admin Master', 'Dashboard Executivo');
      const text = contextService.buildChatContextText(context);
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao copiar contexto:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white tracking-tight">Central 360° — Dashboard Executivo</h1>
          <p className="text-gray-500 dark:text-gray-400">Inteligência estratégica e monitoramento operacional em tempo real.</p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/financeiro"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-green text-white hover:bg-brand-green/90 hover:shadow-md active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            Módulo Financeiro
          </a>
          <button 
            onClick={handleCopyContext}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm",
              copyStatus === 'success' 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                : copyStatus === 'error'
                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                : "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md active:scale-95"
            )}
          >
            {copyStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Contexto copiado
              </>
            ) : copyStatus === 'error' ? (
              'Erro ao copiar contexto'
            ) : (
              <>
                <Brain className="w-4 h-4 text-brand-green" />
                Copiar contexto ChatGPT
              </>
            )}
          </button>
          <button 
            onClick={() => setIsMonitoringMode(!isMonitoringMode)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              isMonitoringMode 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            )}
          >
            {isMonitoringMode ? 'Sair do Modo Monitoramento' : 'Modo Monitoramento'}
          </button>
          <DashboardCustomizer onSave={saveKPIs} currentKPIs={selectedKPIs} />
          <div className="flex items-center gap-2 text-sm font-bold text-brand-green bg-brand-green/5 dark:bg-brand-green/10 px-4 py-2 rounded-xl border border-brand-green/10 dark:border-brand-green/20">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
            Operação em Tempo Real
          </div>
        </div>
      </div>

      {isMonitoringMode ? (
        <div className="fixed inset-0 z-50 bg-black p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Camera className="w-8 h-8 text-brand-green" />
              Central de Monitoramento — Sala de Controle
            </h2>
            <button 
              onClick={() => setIsMonitoringMode(false)}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
            >
              Sair do Modo Monitoramento
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cameras.length > 0 ? cameras.map((cam, i) => (
              <div key={i} className="bg-gray-900 rounded-xl overflow-hidden relative group aspect-video border border-white/10">
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center overflow-hidden">
                  {cam.status === 'online' ? (
                    <video
                      src={cam.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-600 font-mono text-[10px]">OFF</div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full", cam.status === 'online' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                      <span className={cn("w-2 h-2 rounded-full", cam.status === 'online' ? "bg-emerald-500" : "bg-red-500")}></span>
                      {cam.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{cam.name}</p>
                  <p className="text-xs text-gray-300 truncate">{cam.location}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                Nenhuma câmera configurada para monitoramento.
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <KpiGrid allStats={allStats} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">Crítico</span>
                </div>
                <h3 className="text-2xl font-black mb-1">3 Clientes</h3>
                <p className="text-red-100 text-sm font-medium mb-4">Risco de Inadimplência Alta</p>
                <button className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
                  Ver detalhes <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Atenção</span>
                </div>
                <h3 className="text-2xl font-black text-soft-black dark:text-white mb-1">1 Contrato</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">Vence em 30 dias (Alto Valor)</p>
                <button className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 hover:gap-2 transition-all">
                  Acessar CRM <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Alerta</span>
                </div>
                <h3 className="text-2xl font-black text-soft-black dark:text-white mb-1">+5% Custos</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">Acima da meta operacional</p>
                <button className="text-xs font-bold text-blue-600 dark:text-blue-500 flex items-center gap-1 hover:gap-2 transition-all">
                  Analisar DRE <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-1 bg-gradient-to-br from-emerald-500 to-brand-green rounded-2xl p-6 text-white shadow-lg shadow-brand-green/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">Positivo</span>
                </div>
                <h3 className="text-2xl font-black mb-1">15 Dias</h3>
                <p className="text-emerald-100 text-sm font-medium mb-4">Projeção de caixa positiva</p>
                <button className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
                  Ver Fluxo <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2 dark:text-white">
              <TrendingUp className="w-5 h-5 text-brand-green" />
              Evolução do Faturamento Mensal
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                Faturamento
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Recebido
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {faturamentoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={faturamentoData}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A859" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00A859" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#141414', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#00A859' }}
                    formatter={(value: number, name: string) => [`R$ ${value.toLocaleString()}`, name === 'faturamento' ? 'Faturamento' : 'Recebido']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="faturamento" 
                    stroke="#00A859" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValor)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="recebido" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRecebido)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                Aguardando dados de faturamento...
              </div>
            )}
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 dark:text-white">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Clientes Inadimplentes
            </h3>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">Top Atrasos</span>
          </div>
          <div className="space-y-4">
            {inadimplentes.length > 0 ? inadimplentes.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-soft-black dark:text-white truncate max-w-[180px]">{item.cliente}</p>
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400">{item.dias} dias</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor em aberto</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">R$ {item.valor.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">{item.status}</span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-xs font-medium">
                Nenhum registro de inadimplência encontrado.
              </div>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
            <a href="/financeiro" className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">Ver Gestão de Cobrança</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Maiores Contratos
            </h3>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">Top 3</span>
          </div>
          <div className="space-y-4">
            {topContratos.length > 0 ? topContratos.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-soft-black dark:text-white truncate max-w-[180px]">{item.cliente}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", item.status === 'Ativo' ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10")}>{item.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vigência: {item.vigencia}</p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">R$ {item.valor.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-xs font-medium">
                Nenhum contrato encontrado.
              </div>
            )}
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <Activity className="w-5 h-5 text-emerald-500" />
              DRE Gerencial (Resumo)
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">Mês Atual</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Bruta</span>
              <span className="text-sm font-bold text-soft-black dark:text-white">R$ 1.650.000</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Impostos e Deduções</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">- R$ 247.500</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Custos Operacionais</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">- R$ 850.000</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Margem de Contribuição</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-500">R$ 552.500 (33.5%)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas Fixas</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">- R$ 180.000</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <span className="text-sm font-bold text-blue-800 dark:text-blue-400">EBITDA</span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-500">R$ 372.500 (22.5%)</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
            <a href="/financeiro/resultado" className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">Ver DRE Completo</a>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <Calendar className="w-5 h-5 text-blue-500" />
              Próximos Recebimentos
            </h3>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">Curto Prazo</span>
          </div>
          <div className="space-y-4">
            {proximosRecebimentos.length > 0 ? proximosRecebimentos.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-soft-black dark:text-white truncate max-w-[180px]">{item.cliente}</p>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{item.vencimento}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor a receber</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">R$ {item.valor.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-xs font-medium">
                Nenhum recebimento próximo.
              </div>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
            <a href="/financeiro" className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">Ver Módulo Financeiro</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 dark:text-white">
              <MapPin className="w-5 h-5 text-brand-green" />
              Mapa Operacional
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{postos.length} Postos Ativos</span>
              <a 
                href="https://www.google.com/maps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-brand-green font-medium hover:underline"
              >
                Ver mapa completo
              </a>
            </div>
          </div>
          <div className="flex-1 relative min-h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30000.0!2d-43.4350!3d-22.9900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bd0a2c2665973%3A0x88969f6a5b29013e!2sBarra%20da%20Tijuca%2C%20Rio%20de%20Janeiro%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full grayscale-[0.2] contrast-[1.1] dark:invert dark:hue-rotate-180 dark:opacity-80"
            ></iframe>

            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white dark:from-[#141414] via-white/80 dark:via-[#141414]/80 to-transparent pointer-events-none z-10"></div>

            <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 text-xs space-y-3 z-20 pointer-events-auto">
              <h4 className="font-bold text-soft-black dark:text-white border-b border-gray-100 dark:border-white/5 pb-2 mb-2 uppercase tracking-widest text-[10px]">Legenda Operacional</h4>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-brand-green rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Vigilante Ativo</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Ronda em Andamento</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Posto Monitorado</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-red-600 rounded-full shadow-sm animate-pulse"></span>
                <span className="font-bold text-red-600 dark:text-red-400">Alerta Crítico / Pânico</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 dark:text-white">
              <Clock className="w-5 h-5 text-brand-green" />
              Eventos Recentes
            </h3>
            <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-1 rounded-full">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] scrollbar-hide">
             <div className="py-20 text-center text-gray-500 text-xs font-medium">
                Aguardando novos eventos...
             </div>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full py-2 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green transition-colors uppercase tracking-widest text-[10px]"
            >
              Ver Histórico Completo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <Users className="w-5 h-5 text-brand-green" />
              Melhores Vigilantes
            </h3>
            <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-lg">Top 4</span>
          </div>
          <div className="space-y-4">
            {vigilantes.length > 0 ? vigilantes.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4).map((v, index) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-soft-black dark:text-white leading-tight truncate max-w-[120px]">{v.nome}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Score: {v.score?.toFixed(1)}</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-brand-green"></div>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-xs font-medium">
                Nenhum vigilante cadastrado.
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-center">
            <a href="/vigilantes" className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">Ver Ranking Completo</a>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Postos com Maior Risco
            </h3>
            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">Crítico</span>
          </div>
          <div className="space-y-4">
            {postos.length > 0 ? postos.slice(0, 4).map((p, index) => (
              <div key={p.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-soft-black dark:text-white truncate max-w-[120px]">{p.nome}</p>
                  <span className="text-xs font-black text-red-500">{p.risco}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${p.risco}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-xs font-medium">
                Nenhum posto cadastrado.
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-center">
            <a href="/inteligencia" className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">Ver Análise de Risco</a>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Ações Obrigatórias
            </h3>
            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">Pendente</span>
          </div>
          <div className="space-y-3">
             <div className="py-10 text-center text-gray-500 text-xs font-medium">
                Nenhuma ação pendente.
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-center">
            <button className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">Ver Todas as Tarefas</button>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-soft-black dark:text-white">
              <Zap className="w-5 h-5 text-brand-green" />
              Saúde da Operação
            </h3>
            <span className="text-[10px] font-bold text-brand-green bg-brand-green/5 dark:bg-brand-green/10 px-2 py-1 rounded-lg">{saudeOperacao.coberturaPostos}% Eficiência</span>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Cobertura dos Postos', value: saudeOperacao.coberturaPostos, color: 'bg-brand-green' },
              { label: 'Conformidade das Rondas', value: saudeOperacao.conformidadeRondas, color: 'bg-emerald-500' },
              { label: 'Documentação (CNV) em Dia', value: saudeOperacao.documentacaoEmDia, color: 'bg-amber-500' },
              { label: 'Equipamentos Ativos', value: saudeOperacao.equipamentosAtivos, color: 'bg-blue-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-soft-black dark:text-white">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", item.color)}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        title={selectedCamera ? `${selectedCamera.name} - ${selectedCamera.location}` : 'Câmera'}
        maxWidth="max-w-4xl"
      >
        {selectedCamera && (
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
            {selectedCamera.status === 'online' ? (
              <video
                src={selectedCamera.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono">CÂMERA OFFLINE</div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Histórico Completo de Eventos"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
           <div className="py-20 text-center text-gray-500 text-sm font-medium">
              Nenhum histórico disponível no momento.
           </div>
        </div>
      </Modal>
    </div>
  );
}
