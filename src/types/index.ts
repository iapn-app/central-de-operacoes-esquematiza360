export type VigilanteStatus = 'Ativo' | 'Em ronda' | 'Offline';
export type Severidade = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type RondaStatus = 'Realizada' | 'Atrasada' | 'Pendente';

export interface Vigilante {
  id: string;
  nome: string;
  posto: string;
  turno: string;
  status: VigilanteStatus;
  ultimaRonda?: string;
  score?: number;
  pontualidade?: number;
  rondasRealizadas?: number;
  ocorrenciasRegistradas?: number;
  atrasos?: number;
  avaliacoesSupervisor?: number;
  lat?: number;
  lng?: number;
}

export interface Ocorrencia {
  id: string;
  tipo: string;
  posto: string;
  severidade: Severidade;
  horario: string;
  descricao: string;
  imagem: string;
  lat?: number;
  lng?: number;
}

export interface Posto {
  id: string;
  nome: string;
  ultimaRonda: string;
  statusRonda: RondaStatus;
  lat?: number;
  lng?: number;
  vulnerabilidade?: number;
}

export interface Contrato {
  id: string;
  cliente: string;
  contrato: string;
  valorMensal: number;
  status: 'Ativo' | 'Suspenso';
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: 'Condomínio' | 'Posto' | 'Empresa';
  bairro: string;
  endereco: string;
  status: 'Ativo' | 'Inativo';
}

export type UserRole = 'admin_master' | 'owner' | 'gerente' | 'financeiro';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface User {
  email: string;
  nome: string;
  role: UserRole;
}

export interface AuthSession {
  authenticated: boolean;
  user: User | null;
}

export interface Report {
  id: string;
  title: string;
  type: 'Semanal' | 'Mensal';
  date: string;
  downloadUrl: string;
}

export interface Previsao {
  id: number;
  posto: string;
  horario: string;
  probabilidade: 'Alta' | 'Média' | 'Baixa';
  descricao: string;
}

export interface Escala {
  id: string;
  postoId: string;
  postoNome: string;
  vigilanteId: string;
  vigilanteNome: string;
  data: string;
  turno: string;
  status: 'Confirmado' | 'Pendente' | 'Falta' | 'Substituído';
  substitutoId?: string;
}

export interface Disponibilidade {
  vigilanteId: string;
  vigilanteNome: string;
  distanciaKm: number;
  score: number;
  historicoSubstituicoes: number;
  disponivel: boolean;
  bairro: string;
}

export interface FinanceiroPosto {
  id: string;
  postoNome: string;
  receita: number;
  custoOperacional: number;
  margem: number;
  margemPercentual: number;
}

export interface FinanceiroContrato {
  id: string;
  clienteNome: string;
  numeroContrato: string;
  valorMensal: number;
  custosDiretos: number;
  impostos: number;
  margemLiquida: number;
}

export interface RentabilidadeCliente {
  id: string;
  clienteNome: string;
  totalReceita: number;
  totalCusto: number;
  rentabilidade: number;
  status: 'Alta' | 'Média' | 'Baixa';
}
