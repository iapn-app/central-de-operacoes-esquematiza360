import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, UserMinus, Calendar, Clock, DollarSign,
  Heart, FileText, AlertTriangle, CheckCircle2, X, Plus,
  Search, Filter, ChevronDown, ChevronUp, Bell, Shield,
  Briefcase, ClipboardList, Activity, TrendingDown, RefreshCw,
  Download, Eye, Edit3, Save,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type AbaDP = 'admissao' | 'ferias' | 'ponto' | 'encargos' | 'medicina';

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  posto: string;
  empresa: string;
  turno: string;
  salario_base: number;
  status: string;
  faltas: number;
  horas_extras_50: number;
  horas_extras_100: number;
  dias_trabalhados: number;
  insalubre: boolean;
  cpf?: string;
}

interface SolicitacaoFerias {
  id: string;
  funcionario_id: string;
  funcionario_nome: string;
  data_inicio: string;
  data_fim: string;
  dias: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  tipo: 'ferias' | 'afastamento_medico' | 'licenca_maternidade' | 'licenca_paternidade' | 'outros';
  observacao: string | null;
  created_at: string;
}

interface RegistroPonto {
  id: string;
  funcionario_id: string;
  funcionario_nome: string;
  data: string;
  entrada: string | null;
  saida: string | null;
  horas_trabalhadas: number;
  status: 'normal' | 'falta' | 'he' | 'folga';
}

interface ExameASO {
  id: string;
  funcionario_id: string;
  funcionario_nome: string;
  tipo: 'admissional' | 'periodico' | 'demissional' | 'retorno';
  data_realizacao: string;
  data_vencimento: string | null;
  resultado: 'apto' | 'inapto' | 'apto_restricoes';
  medico: string | null;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const EMPRESAS = ['Vigilância', 'Serviços', 'Patrimonial', 'Prevenção', 'Inteligência'];

// ─── Dias até vencimento ─────────────────────────────────────────────────────

function diasAte(data: string): number {
  const d = new Date(data);
  const hoje = new Date();
  return Math.round((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function corVencimento(dias: number) {
  if (dias < 0)   return 'text-red-600 bg-red-50 border-red-200';
  if (dias <= 15) return 'text-red-600 bg-red-50 border-red-200';
  if (dias <= 30) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-emerald-700 bg-emerald-50 border-emerald-200';
}

// ─── ABA ADMISSÃO / DEMISSÃO ─────────────────────────────────────────────────

const FORM_ADM_VAZIO = {
  // ASO (etapa 1)
  aso_medico:'', aso_data:'', aso_resultado:'apto', aso_vencimento:'',
  // Identificação (etapa 2)
  nome:'', cpf:'', rg:'', orgao_emissor:'',
  data_nascimento:'', sexo:'', estado_civil:'', escolaridade:'',
  endereco:'', cep:'', telefone:'',
  // Contrato (etapa 3)
  cargo:'Vigilante', empresa:'Vigilância', tipo_contrato:'CLT',
  data_admissao:'', salario_base:'2850', turno:'12x36 D',
  posto:'', periodo_experiencia:'45+45',
  // Documentos (etapa 4)
  ctps_numero:'', ctps_serie:'', pis:'', titulo_eleitor:'',
  reservista:'', cnh:'', banco_conta:'',
  // Vigilante (etapa 5 - só vigilante)
  registro_pf:'', validade_registro:'', porte_arma:'',
  validade_porte:'', ultimo_curso_tiro:'', venc_reciclagem:'', tipo_armamento:'',
  // Benefícios
  vale_transporte:true, vale_refeicao:true, plano_saude:false,
  seguro_vida:false, insalubre:false,
  // Emergência
  contato_nome:'', contato_parentesco:'', contato_telefone:'',
};

function TabAdmissao({ funcionarios, onAtualizar }: {
  funcionarios: Funcionario[];
  onAtualizar: () => void;
}) {
  const [modalAdm, setModalAdm] = useState(false);
  const [modalDem, setModalDem] = useState<Funcionario | null>(null);
  const [busca, setBusca]       = useState('');
  const [etapa, setEtapa]       = useState(1);
  const [form, setForm]         = useState<typeof FORM_ADM_VAZIO>(FORM_ADM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState<string | null>(null);

  const filtrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.cargo.toLowerCase().includes(busca.toLowerCase())
  );

  function campo(f: string, v: string) { setForm(p => ({...p, [f]: v})); }
  function check(f: string, v: boolean) { setForm(p => ({...p, [f]: v})); }

  const isVigilante = form.cargo === 'Vigilante';

  const ETAPAS = [
    'ASO', 'Identificação', 'Contrato', 'Documentos',
    ...(isVigilante ? ['Vigilante'] : []),
    'Benefícios', 'Emergência',
  ];
  const totalEtapas = ETAPAS.length;

  async function admitir() {
    if (!form.nome || !form.posto || !form.data_admissao) {
      setErro('Preencha nome, posto e data de admissão.'); return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.from('folha_pagamento').insert({
        nome: form.nome, cpf: form.cpf || null, cargo: form.cargo,
        posto: form.posto, empresa: form.empresa, turno: form.turno,
        salario_base: parseFloat(form.salario_base) || 2850,
        insalubre: form.insalubre, dias_trabalhados: 30,
        horas_extras_50: 0, horas_extras_100: 0, faltas: 0, status: 'ativo',
      });
      if (error) throw error;
      await supabase.from('dp_historico').insert({
        tipo: 'admissao', funcionario_nome: form.nome,
        cargo: form.cargo, empresa: form.empresa,
        data_evento: form.data_admissao,
        observacao: `Contrato ${form.tipo_contrato} | PIS: ${form.pis || '—'} | CTPS: ${form.ctps_numero || '—'}`,
      });
      onAtualizar();
      setModalAdm(false);
      setEtapa(1);
      setForm(FORM_ADM_VAZIO);
    } catch (e: any) {
      setErro(e.message);
    } finally { setSalvando(false); }
  }

  async function demitir(f: Funcionario, motivo: string) {
    await supabase.from('folha_pagamento').update({ status: 'inativo' }).eq('id', f.id);
    await supabase.from('dp_historico').insert({
      tipo: 'demissao', funcionario_nome: f.nome, cargo: f.cargo, empresa: f.empresa,
      data_evento: new Date().toISOString().split('T')[0], observacao: motivo,
    });
    onAtualizar();
    setModalDem(null);
  }

  const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500";
  const sel = inp;
  const lbl = "text-xs font-bold text-gray-500 uppercase";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Ativos',        value: funcionarios.filter(f=>f.status==='ativo').length,   cor:'bg-emerald-50 text-emerald-600' },
          { label:'Inativos',      value: funcionarios.filter(f=>f.status==='inativo').length, cor:'bg-red-50 text-red-600' },
          { label:'Admissões mês', value: 0, cor:'bg-blue-50 text-blue-600' },
          { label:'Demissões mês', value: 0, cor:'bg-amber-50 text-amber-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${k.cor}`}><Users className="w-4 h-4" /></div>
            <div><p className="text-xs text-slate-400">{k.label}</p><p className="text-2xl font-black text-slate-900">{k.value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar funcionário..." value={busca} onChange={e=>setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button onClick={()=>{ setModalAdm(true); setEtapa(1); setForm(FORM_ADM_VAZIO); }} style={{cursor:'pointer'}}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
          <UserPlus className="w-4 h-4" /> Nova Admissão
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Funcionário</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Empresa</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Cargo</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Salário</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
          </tr></thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                {funcionarios.length === 0 ? 'Nenhum funcionário cadastrado.' : 'Nenhum resultado.'}
              </td></tr>
            ) : filtrados.map(f => (
              <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-800">{f.nome}</p><p className="text-xs text-slate-400">{f.posto}</p></td>
                <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{f.empresa}</span></td>
                <td className="px-4 py-3 text-sm text-slate-600">{f.cargo}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{fmt(f.salario_base)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${f.status==='ativo'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}>
                    {f.status==='ativo'?'Ativo':'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {f.status==='ativo' && (
                    <button onClick={()=>setModalDem(f)} style={{cursor:'pointer'}} className="text-xs font-semibold text-red-600 hover:underline">Demitir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Admissão por etapas */}
      {modalAdm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">Nova Admissão</h2>
                <p className="text-xs text-slate-400 mt-0.5">Etapa {etapa} de {totalEtapas}: {ETAPAS[etapa-1]}</p>
              </div>
              <button onClick={()=>setModalAdm(false)} style={{cursor:'pointer'}} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"><X className="w-4 h-4"/></button>
            </div>

            {/* Progresso */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="flex gap-1.5">
                {ETAPAS.map((_,i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < etapa ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {ETAPAS.map((e,i) => (
                  <span key={i} className={`text-[10px] ${i < etapa ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>{e}</span>
                ))}
              </div>
            </div>

            {/* Conteúdo por etapa */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* ETAPA 1: ASO admissional — OBRIGATÓRIO PRIMEIRO */}
              {etapa === 1 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">ASO Admissional obrigatório antes de qualquer documento</p>
                      <p className="text-xs text-amber-600 mt-0.5">Se o resultado for inapto, o processo é encerrado aqui. Nenhum contrato é assinado.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1"><label className={lbl}>Médico / Clínica Responsável</label>
                      <input className={inp} value={form.aso_medico} onChange={e=>campo('aso_medico',e.target.value)} placeholder="Dr. Nome ou Clínica Saúde Ltda" /></div>
                    <div className="space-y-1"><label className={lbl}>Data do Exame *</label>
                      <input type="date" className={inp} value={form.aso_data} onChange={e=>campo('aso_data',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Vencimento do ASO</label>
                      <input type="date" className={inp} value={form.aso_vencimento} onChange={e=>campo('aso_vencimento',e.target.value)} /></div>
                    <div className="col-span-2 space-y-1"><label className={lbl}>Resultado *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value:'apto',          label:'Apto',              cor:'border-emerald-400 bg-emerald-50 text-emerald-800' },
                          { value:'apto_restricoes',label:'Apto c/ restrições',cor:'border-amber-400 bg-amber-50 text-amber-800' },
                          { value:'inapto',         label:'Inapto',            cor:'border-red-400 bg-red-50 text-red-800' },
                        ].map(op => (
                          <button key={op.value} type="button" onClick={()=>campo('aso_resultado',op.value)} style={{cursor:'pointer'}}
                            className={`py-3 rounded-xl border-2 text-sm font-bold transition ${form.aso_resultado===op.value ? op.cor+' border-2' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                            {op.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alerta inapto */}
                  {form.aso_resultado === 'inapto' && (
                    <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-4 space-y-2">
                      <p className="text-sm font-bold text-red-800">Candidato inapto — processo encerrado</p>
                      <p className="text-xs text-red-600">O candidato não pode ser admitido. Registre o exame e encerre o processo.</p>
                      <button onClick={async ()=>{
                        if (form.aso_data) {
                          await supabase.from('dp_medicina').insert({
                            funcionario_nome: form.nome || 'Candidato não admitido',
                            tipo: 'admissional', data_realizacao: form.aso_data,
                            resultado: 'inapto', medico: form.aso_medico || null,
                          });
                        }
                        setModalAdm(false); setEtapa(1); setForm(FORM_ADM_VAZIO);
                      }} style={{cursor:'pointer'}}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition">
                        Registrar e encerrar processo
                      </button>
                    </div>
                  )}

                  {/* Info apto com restrições */}
                  {form.aso_resultado === 'apto_restricoes' && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                      <p className="text-xs font-bold text-amber-800">Apto com restrições</p>
                      <p className="text-xs text-amber-600 mt-0.5">O candidato pode ser admitido, mas deve ser alocado conforme as restrições médicas indicadas no ASO.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 2: Identificação */}
              {etapa === 2 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-blue-700">Identificação Pessoal</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1"><label className={lbl}>Nome Completo *</label>
                      <input className={inp} value={form.nome} onChange={e=>campo('nome',e.target.value)} placeholder="Nome completo do funcionário" /></div>
                    <div className="space-y-1"><label className={lbl}>CPF *</label>
                      <input className={inp} value={form.cpf} onChange={e=>campo('cpf',e.target.value)} placeholder="000.000.000-00" /></div>
                    <div className="space-y-1"><label className={lbl}>Telefone / WhatsApp *</label>
                      <input className={inp} value={form.telefone} onChange={e=>campo('telefone',e.target.value)} placeholder="(11) 99999-9999" /></div>
                    <div className="space-y-1"><label className={lbl}>RG</label>
                      <input className={inp} value={form.rg} onChange={e=>campo('rg',e.target.value)} placeholder="0000000" /></div>
                    <div className="space-y-1"><label className={lbl}>Órgão Emissor</label>
                      <input className={inp} value={form.orgao_emissor} onChange={e=>campo('orgao_emissor',e.target.value)} placeholder="SSP/SP" /></div>
                    <div className="space-y-1"><label className={lbl}>Data de Nascimento</label>
                      <input type="date" className={inp} value={form.data_nascimento} onChange={e=>campo('data_nascimento',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Sexo</label>
                      <select className={sel} value={form.sexo} onChange={e=>campo('sexo',e.target.value)}>
                        <option value="">Selecione...</option><option>Masculino</option><option>Feminino</option><option>Outro</option>
                      </select></div>
                    <div className="space-y-1"><label className={lbl}>Estado Civil</label>
                      <select className={sel} value={form.estado_civil} onChange={e=>campo('estado_civil',e.target.value)}>
                        <option value="">Selecione...</option><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União estável</option>
                      </select></div>
                    <div className="space-y-1"><label className={lbl}>Escolaridade</label>
                      <select className={sel} value={form.escolaridade} onChange={e=>campo('escolaridade',e.target.value)}>
                        <option value="">Selecione...</option><option>Fundamental</option><option>Médio incompleto</option><option>Médio completo</option><option>Superior incompleto</option><option>Superior completo</option><option>Pós-graduação</option>
                      </select></div>
                    <div className="col-span-2 space-y-1"><label className={lbl}>Endereço Completo</label>
                      <input className={inp} value={form.endereco} onChange={e=>campo('endereco',e.target.value)} placeholder="Rua, número, bairro, cidade — Estado" /></div>
                    <div className="space-y-1"><label className={lbl}>CEP</label>
                      <input className={inp} value={form.cep} onChange={e=>campo('cep',e.target.value)} placeholder="00000-000" /></div>
                  </div>
                </div>
              )}

              {/* ETAPA 3: Contrato */}
              {etapa === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-emerald-700">Dados do Contrato</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className={lbl}>Cargo / Função *</label>
                      <input className={inp} value={form.cargo} onChange={e=>campo('cargo',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Empresa *</label>
                      <select className={sel} value={form.empresa} onChange={e=>campo('empresa',e.target.value)}>
                        {EMPRESAS.map(e=><option key={e}>{e}</option>)}
                      </select></div>
                    <div className="space-y-1"><label className={lbl}>Tipo de Contrato</label>
                      <select className={sel} value={form.tipo_contrato} onChange={e=>campo('tipo_contrato',e.target.value)}>
                        <option>CLT</option><option>PJ</option><option>Estágio</option><option>Temporário</option><option>Aprendiz</option>
                      </select></div>
                    <div className="space-y-1"><label className={lbl}>Data de Admissão *</label>
                      <input type="date" className={inp} value={form.data_admissao} onChange={e=>campo('data_admissao',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Salário Base (R$) *</label>
                      <input type="number" className={inp} value={form.salario_base} onChange={e=>campo('salario_base',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Turno / Jornada</label>
                      <select className={sel} value={form.turno} onChange={e=>campo('turno',e.target.value)}>
                        {['12x36 D','12x36 N','8h D','6h D','24h','Comercial 8h','Meio período'].map(t=><option key={t}>{t}</option>)}
                      </select></div>
                    <div className="space-y-1"><label className={lbl}>Posto / Setor *</label>
                      <input className={inp} value={form.posto} onChange={e=>campo('posto',e.target.value)} placeholder="Nome do posto ou setor" /></div>
                    <div className="space-y-1"><label className={lbl}>Período de Experiência</label>
                      <select className={sel} value={form.periodo_experiencia} onChange={e=>campo('periodo_experiencia',e.target.value)}>
                        <option value="45+45">45 + 45 dias</option><option value="30+30">30 + 30 dias</option><option value="90">90 dias corridos</option><option value="nao">Não aplicável</option>
                      </select></div>
                  </div>
                </div>
              )}

              {/* ETAPA 4: Documentos */}
              {etapa === 4 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-amber-700">Documentos Trabalhistas</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className={lbl}>Nº CTPS</label>
                      <input className={inp} value={form.ctps_numero} onChange={e=>campo('ctps_numero',e.target.value)} placeholder="0000000" /></div>
                    <div className="space-y-1"><label className={lbl}>Série CTPS</label>
                      <input className={inp} value={form.ctps_serie} onChange={e=>campo('ctps_serie',e.target.value)} placeholder="000-SP" /></div>
                    <div className="space-y-1"><label className={lbl}>PIS / PASEP</label>
                      <input className={inp} value={form.pis} onChange={e=>campo('pis',e.target.value)} placeholder="000.00000.00-0" /></div>
                    <div className="space-y-1"><label className={lbl}>Título de Eleitor</label>
                      <input className={inp} value={form.titulo_eleitor} onChange={e=>campo('titulo_eleitor',e.target.value)} placeholder="0000 0000 0000" /></div>
                    <div className="space-y-1"><label className={lbl}>Reservista</label>
                      <input className={inp} value={form.reservista} onChange={e=>campo('reservista',e.target.value)} placeholder="Nº da reservista" /></div>
                    <div className="space-y-1"><label className={lbl}>CNH (categoria)</label>
                      <select className={sel} value={form.cnh} onChange={e=>campo('cnh',e.target.value)}>
                        <option value="">Não possui</option><option>A</option><option>B</option><option>AB</option><option>C</option><option>D</option><option>E</option>
                      </select></div>
                    <div className="col-span-2 space-y-1"><label className={lbl}>Banco / Conta Salário</label>
                      <input className={inp} value={form.banco_conta} onChange={e=>campo('banco_conta',e.target.value)} placeholder="Ex: Itaú — Ag 7157 / Cc 12345-6" /></div>
                  </div>
                </div>
              )}

              {/* ETAPA 5 (só vigilante): Registro PF */}
              {etapa === 5 && isVigilante && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-red-700">Documentos Específicos de Vigilante — Polícia Federal</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className={lbl}>Nº Registro PF</label>
                      <input className={inp} value={form.registro_pf} onChange={e=>campo('registro_pf',e.target.value)} placeholder="000000" /></div>
                    <div className="space-y-1"><label className={lbl}>Validade do Registro</label>
                      <input type="date" className={inp} value={form.validade_registro} onChange={e=>campo('validade_registro',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Porte de Arma (nº)</label>
                      <input className={inp} value={form.porte_arma} onChange={e=>campo('porte_arma',e.target.value)} placeholder="Nº do porte" /></div>
                    <div className="space-y-1"><label className={lbl}>Validade do Porte</label>
                      <input type="date" className={inp} value={form.validade_porte} onChange={e=>campo('validade_porte',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Último Curso de Tiro</label>
                      <input type="date" className={inp} value={form.ultimo_curso_tiro} onChange={e=>campo('ultimo_curso_tiro',e.target.value)} /></div>
                    <div className="space-y-1"><label className={lbl}>Vencimento Reciclagem</label>
                      <input type="date" className={inp} value={form.venc_reciclagem} onChange={e=>campo('venc_reciclagem',e.target.value)} /></div>
                    <div className="col-span-2 space-y-1"><label className={lbl}>Tipo de Armamento</label>
                      <select className={sel} value={form.tipo_armamento} onChange={e=>campo('tipo_armamento',e.target.value)}>
                        <option value="">Selecione...</option><option>Revólver .38</option><option>Pistola 9mm</option><option>Pistola .40</option><option>Pistola .380</option><option>Não armado</option>
                      </select></div>
                  </div>
                </div>
              )}

              {/* ETAPA Benefícios */}
              {((etapa === 5 && !isVigilante) || (etapa === 6 && isVigilante)) && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-purple-700">Benefícios</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { campo:'vale_transporte', label:'Vale Transporte',     desc:'Desconto proporcional ao uso' },
                      { campo:'vale_refeicao',   label:'Vale Refeição',       desc:'R$ 22/dia útil trabalhado' },
                      { campo:'plano_saude',     label:'Plano de Saúde',      desc:'Coparticipação do funcionário' },
                      { campo:'seguro_vida',     label:'Seguro de Vida',      desc:'Cobertura por acidente/morte' },
                      { campo:'insalubre',       label:'Insalubridade (20%)', desc:'Sobre o piso salarial' },
                    ].map(b => (
                      <label key={b.campo} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                        <input type="checkbox" checked={(form as any)[b.campo]}
                          onChange={e=>check(b.campo, e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{b.label}</p>
                          <p className="text-xs text-slate-400">{b.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ETAPA Emergência + Resumo final */}
              {((etapa === 6 && !isVigilante) || (etapa === 7 && isVigilante)) && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-slate-600">Contato de Emergência</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1"><label className={lbl}>Nome do Contato</label>
                      <input className={inp} value={form.contato_nome} onChange={e=>campo('contato_nome',e.target.value)} placeholder="Nome completo" /></div>
                    <div className="space-y-1"><label className={lbl}>Parentesco</label>
                      <select className={sel} value={form.contato_parentesco} onChange={e=>campo('contato_parentesco',e.target.value)}>
                        <option value="">Selecione...</option><option>Cônjuge</option><option>Pai/Mãe</option><option>Filho(a)</option><option>Irmão/Irmã</option><option>Outro</option>
                      </select></div>
                    <div className="space-y-1"><label className={lbl}>Telefone</label>
                      <input className={inp} value={form.contato_telefone} onChange={e=>campo('contato_telefone',e.target.value)} placeholder="(11) 99999-9999" /></div>
                  </div>

                  {/* Resumo completo antes de finalizar */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase">Resumo da Admissão</p>
                    {[
                      { label:'ASO',           value: `${form.aso_resultado === 'apto' ? 'Apto' : 'Apto c/ restrições'} — ${form.aso_data ? new Date(form.aso_data).toLocaleDateString('pt-BR') : '—'}` },
                      { label:'Nome',           value: form.nome },
                      { label:'CPF',            value: form.cpf },
                      { label:'Cargo',          value: form.cargo },
                      { label:'Empresa',        value: form.empresa },
                      { label:'Tipo contrato',  value: form.tipo_contrato },
                      { label:'Salário',        value: fmt(parseFloat(form.salario_base)||0) },
                      { label:'Turno',          value: form.turno },
                      { label:'Admissão',       value: form.data_admissao ? new Date(form.data_admissao).toLocaleDateString('pt-BR') : '—' },
                      { label:'Benefícios',     value: [form.vale_transporte&&'VT', form.vale_refeicao&&'VR', form.plano_saude&&'Plano', form.seguro_vida&&'Seguro'].filter(Boolean).join(', ') || 'Nenhum' },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-xs">
                        <span className="text-slate-400">{r.label}</span>
                        <span className="font-semibold text-slate-700">{r.value || '—'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-blue-800 mb-1">Próximo passo após admitir:</p>
                    <p className="text-xs text-blue-600">O sistema irá cadastrar o funcionário na folha automaticamente. Lembre-se de enviar o evento S-2200 ao eSocial antes do primeiro dia de trabalho.</p>
                  </div>
                </div>
              )}

              {erro && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{erro}</div>}
            </div>
            {/* Footer navegação */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={()=>{ if(etapa>1) setEtapa(e=>e-1); else setModalAdm(false); }} style={{cursor:'pointer'}}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
                {etapa === 1 ? 'Cancelar' : '← Voltar'}
              </button>
              <span className="text-xs text-slate-400">{etapa} / {totalEtapas}</span>
              {etapa < totalEtapas ? (
                <button onClick={()=>{ setErro(null); setEtapa(e=>e+1); }} style={{cursor:'pointer'}}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition">
                  Próximo →
                </button>
              ) : (
                <button onClick={admitir} disabled={salvando} style={{cursor:'pointer'}}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> {salvando ? 'Admitindo...' : 'Finalizar Admissão'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {modalDem && <ModalDemissao funcionario={modalDem} onClose={()=>setModalDem(null)} onConfirmar={demitir} />}
    </div>
  );
}


function ModalDemissao({ funcionario, onClose, onConfirmar }: {
  funcionario: Funcionario;
  onClose: () => void;
  onConfirmar: (f: Funcionario, motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState('Pedido do funcionário');
  const [aviso, setAviso] = useState('trabalhado');
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Registrar Demissão</h2>
          <button onClick={onClose} style={{cursor:'pointer'}} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-800">{funcionario.nome}</p>
            <p className="text-xs text-red-600">{funcionario.cargo} · {funcionario.empresa}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Motivo da Demissão</label>
            <select value={motivo} onChange={e=>setMotivo(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500">
              <option>Pedido do funcionário</option>
              <option>Demissão sem justa causa</option>
              <option>Demissão com justa causa</option>
              <option>Término de contrato</option>
              <option>Acordo entre partes</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Aviso Prévio</label>
            <select value={aviso} onChange={e=>setAviso(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500">
              <option value="trabalhado">Trabalhado</option>
              <option value="indenizado">Indenizado</option>
              <option value="dispensado">Dispensado</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button onClick={onClose} style={{cursor:'pointer'}} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
            <button onClick={()=>onConfirmar(funcionario, `${motivo} · Aviso ${aviso}`)} style={{cursor:'pointer'}}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
              <UserMinus className="w-4 h-4" /> Confirmar Demissão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ABA FÉRIAS ──────────────────────────────────────────────────────────────

function TabFerias({ funcionarios }: { funcionarios: Funcionario[] }) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoFerias[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    funcionario_id: '', tipo: 'ferias' as SolicitacaoFerias['tipo'],
    data_inicio: '', data_fim: '', observacao: '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.from('dp_ferias').select('*').order('created_at', {ascending:false})
      .then(({data}) => setSolicitacoes(data ?? []));
  }, []);

  const dias = form.data_inicio && form.data_fim
    ? Math.max(0, Math.round((new Date(form.data_fim).getTime() - new Date(form.data_inicio).getTime()) / (1000*60*60*24)) + 1)
    : 0;

  async function salvar() {
    if (!form.funcionario_id || !form.data_inicio || !form.data_fim) return;
    setSalvando(true);
    const func = funcionarios.find(f=>f.id===form.funcionario_id);
    const { data } = await supabase.from('dp_ferias').insert({
      funcionario_id: form.funcionario_id,
      funcionario_nome: func?.nome ?? '',
      tipo: form.tipo, data_inicio: form.data_inicio,
      data_fim: form.data_fim, dias, status: 'pendente',
      observacao: form.observacao || null,
    }).select().single();
    if (data) setSolicitacoes(prev=>[data, ...prev]);
    setSalvando(false);
    setModal(false);
  }

  async function aprovar(id: string, status: 'aprovada'|'rejeitada') {
    await supabase.from('dp_ferias').update({status}).eq('id', id);
    setSolicitacoes(prev=>prev.map(s=>s.id===id ? {...s,status} : s));
  }

  const tipoLabel: Record<string, string> = {
    ferias: 'Férias', afastamento_medico: 'Afastamento Médico',
    licenca_maternidade: 'Lic. Maternidade', licenca_paternidade: 'Lic. Paternidade', outros: 'Outros',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Pendentes',  value: solicitacoes.filter(s=>s.status==='pendente').length,  cor:'bg-amber-50 text-amber-600' },
          { label:'Aprovadas',  value: solicitacoes.filter(s=>s.status==='aprovada').length,  cor:'bg-emerald-50 text-emerald-600' },
          { label:'Rejeitadas', value: solicitacoes.filter(s=>s.status==='rejeitada').length, cor:'bg-red-50 text-red-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${k.cor}`}><Calendar className="w-4 h-4" /></div>
            <div><p className="text-xs text-slate-400">{k.label}</p><p className="text-2xl font-black text-slate-900">{k.value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={()=>setModal(true)} style={{cursor:'pointer'}}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Nova Solicitação
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {solicitacoes.length === 0 ? (
          <div className="p-12 text-center text-slate-400"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Nenhuma solicitação ainda</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Funcionário</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Período</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Dias</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
            </tr></thead>
            <tbody>
              {solicitacoes.map(s => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{s.funcionario_nome}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{tipoLabel[s.tipo] ?? s.tipo}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(s.data_inicio).toLocaleDateString('pt-BR')} → {new Date(s.data_fim).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-slate-700">{s.dias}d</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      s.status==='aprovada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      s.status==='rejeitada' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>{s.status==='aprovada'?'Aprovada':s.status==='rejeitada'?'Rejeitada':'Pendente'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.status === 'pendente' && (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={()=>aprovar(s.id,'aprovada')} style={{cursor:'pointer'}} className="text-xs font-bold text-emerald-600 hover:underline">Aprovar</button>
                        <button onClick={()=>aprovar(s.id,'rejeitada')} style={{cursor:'pointer'}} className="text-xs font-bold text-red-600 hover:underline">Rejeitar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Nova Solicitação</h2>
              <button onClick={()=>setModal(false)} style={{cursor:'pointer'}} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"><X className="w-4 h-4"/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Funcionário</label>
                <select value={form.funcionario_id} onChange={e=>setForm(p=>({...p,funcionario_id:e.target.value}))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecione...</option>
                  {funcionarios.filter(f=>f.status==='ativo').map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                <select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value as any}))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="ferias">Férias</option>
                  <option value="afastamento_medico">Afastamento Médico</option>
                  <option value="licenca_maternidade">Licença Maternidade</option>
                  <option value="licenca_paternidade">Licença Paternidade</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Data Início</label>
                  <input type="date" value={form.data_inicio} onChange={e=>setForm(p=>({...p,data_inicio:e.target.value}))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Data Fim</label>
                  <input type="date" value={form.data_fim} onChange={e=>setForm(p=>({...p,data_fim:e.target.value}))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              {dias > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-sm font-black text-blue-700">{dias} dias</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <button onClick={()=>setModal(false)} style={{cursor:'pointer'}} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
                <button onClick={salvar} disabled={salvando} style={{cursor:'pointer'}}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
                  {salvando ? 'Salvando...' : 'Solicitar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABA PONTO ───────────────────────────────────────────────────────────────

function TabPonto({ funcionarios }: { funcionarios: Funcionario[] }) {
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [funcSel, setFuncSel] = useState('');
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);

  const meses = Array.from({length:6},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-2+i);
    return { value: d.toISOString().slice(0,7), label: d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}) };
  });

  // Gera espelho de ponto baseado nos dados da folha
  const func = funcionarios.find(f=>f.id===funcSel);
  const totalHe = func ? (func.horas_extras_50 + func.horas_extras_100) : 0;
  const totalFaltas = func ? func.faltas : 0;
  const diasTrab = func ? func.dias_trabalhados : 0;

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        <select value={mes} onChange={e=>setMes(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
          {meses.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={funcSel} onChange={e=>setFuncSel(e.target.value)}
          className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Selecione um funcionário...</option>
          {funcionarios.filter(f=>f.status==='ativo').map(f=><option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>)}
        </select>
      </div>

      {func ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Dias Trabalhados', value: diasTrab, cor:'bg-emerald-50 text-emerald-600' },
              { label:'Faltas',           value: totalFaltas, cor:'bg-red-50 text-red-600' },
              { label:'Horas Extras',     value: `${totalHe}h`, cor:'bg-amber-50 text-amber-600' },
              { label:'Banco de Horas',   value: `+${totalHe}h`, cor:'bg-blue-50 text-blue-600' },
            ].map(k=>(
              <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className={`p-2 rounded-xl w-fit mb-2 ${k.cor}`}><Clock className="w-4 h-4" /></div>
                <p className="text-xs text-slate-400">{k.label}</p>
                <p className="text-2xl font-black text-slate-900">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Espelho de Ponto — {func.nome}</p>
                <p className="text-xs text-slate-400">{func.cargo} · {func.turno} · {func.empresa}</p>
              </div>
              <button style={{cursor:'pointer'}} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({length:30},(_,i)=>{
                const dia = i+1;
                const isFalta = totalFaltas > 0 && dia <= totalFaltas;
                const isHE = totalHe > 0 && dia > 28;
                return (
                  <div key={dia} className={`rounded-xl p-2 text-center border transition ${
                    isFalta ? 'bg-red-50 border-red-200' :
                    isHE    ? 'bg-amber-50 border-amber-200' :
                    dia <= diasTrab ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs font-bold text-slate-700">{dia}</p>
                    <p className={`text-[10px] font-semibold ${isFalta?'text-red-600':isHE?'text-amber-600':dia<=diasTrab?'text-emerald-600':'text-slate-400'}`}>
                      {isFalta?'F':isHE?'HE':dia<=diasTrab?'✓':'—'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 inline-block"/>Presente</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block"/>Falta</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 inline-block"/>Hora Extra</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Selecione um funcionário para ver o espelho de ponto</p>
        </div>
      )}
    </div>
  );
}

// ─── ABA ENCARGOS E BENEFÍCIOS ───────────────────────────────────────────────

function TabEncargos({ funcionarios }: { funcionarios: Funcionario[] }) {
  const ativos = funcionarios.filter(f=>f.status==='ativo');
  const totalSalarios = ativos.reduce((s,f)=>s+f.salario_base,0);
  const totalFGTS     = totalSalarios * 0.08;
  const totalINSS     = totalSalarios * 0.20;
  const totalVT       = ativos.length * 220; // estimativa
  const totalVR       = ativos.length * 480; // estimativa R$22/dia x 22 dias
  const totalPlano    = ativos.filter(f=>f.cargo!=='Vigilante').length * 350;
  const totalEncargos = totalFGTS + totalINSS + totalVT + totalVR + totalPlano;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label:'FGTS (8%)',            value: fmt(totalFGTS),    cor:'bg-orange-50 text-orange-600',  sub:'sobre salário bruto' },
          { label:'INSS Patronal (20%)',  value: fmt(totalINSS),    cor:'bg-red-50 text-red-600',        sub:'encargo do empregador' },
          { label:'Vale Transporte',      value: fmt(totalVT),      cor:'bg-blue-50 text-blue-600',      sub:'estimativa mensal' },
          { label:'Vale Refeição',        value: fmt(totalVR),      cor:'bg-emerald-50 text-emerald-600',sub:'R$ 22/dia × 22 dias' },
          { label:'Plano de Saúde',       value: fmt(totalPlano),   cor:'bg-purple-50 text-purple-600',  sub:'administrativo e supervisores' },
          { label:'Total Encargos',       value: fmt(totalEncargos),cor:'bg-slate-100 text-slate-700',   sub:'custo adicional total' },
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${k.cor}`}><DollarSign className="w-4 h-4" /></div>
            <p className="text-xs text-slate-400">{k.label}</p>
            <p className="text-xl font-black text-slate-900">{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800">Benefícios por Funcionário</p>
          <p className="text-xs text-slate-400">Estimativa mensal de encargos e benefícios</p>
        </div>
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Funcionário</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Salário</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">FGTS</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">INSS Pat.</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Benefícios</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Custo Total</th>
          </tr></thead>
          <tbody>
            {ativos.slice(0,10).map(f=>{
              const fgts = f.salario_base * 0.08;
              const inss = f.salario_base * 0.20;
              const benef = 220 + 480 + (f.cargo!=='Vigilante'?350:0);
              return (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-800">{f.nome}</p><p className="text-xs text-slate-400">{f.cargo}</p></td>
                  <td className="px-4 py-3 text-sm text-right text-slate-600">{fmt(f.salario_base)}</td>
                  <td className="px-4 py-3 text-sm text-right text-orange-600">{fmt(fgts)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-500">{fmt(inss)}</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600">{fmt(benef)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-slate-900">{fmt(f.salario_base+fgts+inss+benef)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ABA MEDICINA OCUPACIONAL ────────────────────────────────────────────────

function TabMedicina({ funcionarios }: { funcionarios: Funcionario[] }) {
  const [exames, setExames] = useState<ExameASO[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    funcionario_id: '', tipo: 'periodico' as ExameASO['tipo'],
    data_realizacao: '', data_vencimento: '', resultado: 'apto' as ExameASO['resultado'], medico: '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.from('dp_medicina').select('*').order('data_vencimento', {ascending:true})
      .then(({data})=>setExames(data ?? []));
  }, []);

  async function salvar() {
    if (!form.funcionario_id || !form.data_realizacao) return;
    setSalvando(true);
    const func = funcionarios.find(f=>f.id===form.funcionario_id);
    const { data } = await supabase.from('dp_medicina').insert({
      funcionario_id: form.funcionario_id,
      funcionario_nome: func?.nome ?? '',
      tipo: form.tipo, data_realizacao: form.data_realizacao,
      data_vencimento: form.data_vencimento || null,
      resultado: form.resultado, medico: form.medico || null,
    }).select().single();
    if (data) setExames(prev=>[data,...prev]);
    setSalvando(false);
    setModal(false);
  }

  const vencendo = exames.filter(e => e.data_vencimento && diasAte(e.data_vencimento) <= 30);
  const tipoLabel: Record<string, string> = { admissional:'Admissional', periodico:'Periódico', demissional:'Demissional', retorno:'Retorno' };

  return (
    <div className="space-y-5">
      {vencendo.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">{vencendo.length} exame(s) vencendo em até 30 dias</p>
          </div>
          <div className="space-y-2">
            {vencendo.map(e=>{
              const d = diasAte(e.data_vencimento!);
              return (
                <div key={e.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                  <div><p className="text-sm font-semibold text-slate-800">{e.funcionario_nome}</p><p className="text-xs text-slate-400">{tipoLabel[e.tipo]}</p></div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${corVencimento(d)}`}>
                    {d < 0 ? `Vencido há ${Math.abs(d)}d` : `Vence em ${d}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={()=>setModal(true)} style={{cursor:'pointer'}}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Registrar ASO
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {exames.length === 0 ? (
          <div className="p-12 text-center text-slate-400"><Activity className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Nenhum exame registrado</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Funcionário</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Realizado em</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Vencimento</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Resultado</th>
            </tr></thead>
            <tbody>
              {exames.map(e=>{
                const d = e.data_vencimento ? diasAte(e.data_vencimento) : null;
                return (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{e.funcionario_nome}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{tipoLabel[e.tipo]}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(e.data_realizacao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      {e.data_vencimento && d !== null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${corVencimento(d)}`}>
                          {d < 0 ? `Vencido` : new Date(e.data_vencimento).toLocaleDateString('pt-BR')}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        e.resultado==='apto' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        e.resultado==='inapto' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{e.resultado==='apto'?'Apto':e.resultado==='inapto'?'Inapto':'Apto c/ restr.'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Registrar ASO</h2>
              <button onClick={()=>setModal(false)} style={{cursor:'pointer'}} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"><X className="w-4 h-4"/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label:'Funcionário', campo:'funcionario_id', type:'select' },
                { label:'Tipo de ASO', campo:'tipo', type:'select-tipo' },
                { label:'Data de Realização', campo:'data_realizacao', type:'date' },
                { label:'Data de Vencimento', campo:'data_vencimento', type:'date' },
                { label:'Resultado', campo:'resultado', type:'select-resultado' },
                { label:'Médico Responsável', campo:'medico', type:'text' },
              ].map(f=>(
                <div key={f.campo} className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={(form as any)[f.campo]} onChange={e=>setForm(p=>({...p,[f.campo]:e.target.value}))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Selecione...</option>
                      {funcionarios.filter(f=>f.status==='ativo').map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                  ) : f.type === 'select-tipo' ? (
                    <select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value as any}))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="admissional">Admissional</option>
                      <option value="periodico">Periódico</option>
                      <option value="demissional">Demissional</option>
                      <option value="retorno">Retorno ao trabalho</option>
                    </select>
                  ) : f.type === 'select-resultado' ? (
                    <select value={form.resultado} onChange={e=>setForm(p=>({...p,resultado:e.target.value as any}))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="apto">Apto</option>
                      <option value="inapto">Inapto</option>
                      <option value="apto_restricoes">Apto com restrições</option>
                    </select>
                  ) : (
                    <input type={f.type} value={(form as any)[f.campo]} onChange={e=>setForm(p=>({...p,[f.campo]:e.target.value}))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <button onClick={()=>setModal(false)} style={{cursor:'pointer'}} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
                <button onClick={salvar} disabled={salvando} style={{cursor:'pointer'}}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
                  {salvando ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function DepartamentoPessoal() {
  const [aba, setAba] = useState<AbaDP>('admissao');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    const {data} = await supabase.from('folha_pagamento').select('*').order('nome');
    setFuncionarios(data ?? []);
    setLoading(false);
  }

  useEffect(()=>{ carregar(); },[]);

  const ativos = funcionarios.filter(f=>f.status==='ativo').length;

  const abas = [
    { id:'admissao', label:'Admissão / Demissão', icon: UserPlus },
    { id:'ferias',   label:'Férias e Afastamentos', icon: Calendar },
    { id:'ponto',    label:'Ponto e Jornada',       icon: Clock },
    { id:'encargos', label:'Encargos e Benefícios', icon: DollarSign },
    { id:'medicina', label:'Medicina Ocupacional',  icon: Heart },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Departamento Pessoal</h1>
          <p className="text-sm text-slate-500 mt-1">{ativos} funcionários ativos — Grupo Esquematiza</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm w-fit">
        {abas.map(t=>{
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={()=>setAba(t.id)} style={{cursor:'pointer'}}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                aba===t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">Carregando...</div>
      ) : (
        <>
          {aba==='admissao' && <TabAdmissao funcionarios={funcionarios} onAtualizar={carregar} />}
          {aba==='ferias'   && <TabFerias   funcionarios={funcionarios} />}
          {aba==='ponto'    && <TabPonto    funcionarios={funcionarios} />}
          {aba==='encargos' && <TabEncargos funcionarios={funcionarios} />}
          {aba==='medicina' && <TabMedicina funcionarios={funcionarios} />}
        </>
      )}
    </div>
  );
}
