export type RiskBand = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export interface RiskFactors {
  ocorrenciasRecentes: number; // Peso: 30
  atrasosRonda: number; // Peso: 15
  falhasChecklist: number; // Peso: 10
  geocercaRompida: number; // Peso: 15
  ausenciaVigilante: number; // Peso: 20
  incidentesCriticos: number; // Peso: 40
  falhasEquipamento: number; // Peso: 10
  documentacaoIrregular: number; // Peso: 10
  historicoPosto: number; // 0-100, Peso: 10
  turnoVulneravel: boolean; // Peso: 10
}

/**
 * Calcula o Score de Risco Operacional (0 a 100)
 * Quanto maior o score, maior o risco.
 */
export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;
  
  // Ocorrências têm alto impacto (até 30 pontos)
  score += Math.min(factors.ocorrenciasRecentes * 10, 30);
  
  // Atrasos de ronda (até 15 pontos)
  score += Math.min(factors.atrasosRonda * 5, 15);
  
  // Falhas de checklist (até 10 pontos)
  score += Math.min(factors.falhasChecklist * 2, 10);
  
  // Quebra de geocerca é grave (15 pontos por ocorrência)
  score += Math.min(factors.geocercaRompida * 15, 15);
  
  // Ausência de vigilante é muito grave (20 pontos)
  score += Math.min(factors.ausenciaVigilante * 20, 20);
  
  // Incidentes críticos (roubo, agressão) são os mais graves (40 pontos)
  score += Math.min(factors.incidentesCriticos * 40, 40);
  
  // Falhas de equipamento (câmeras, rádio) (até 10 pontos)
  score += Math.min(factors.falhasEquipamento * 5, 10);
  
  // Documentação irregular (CNV vencida, etc) (até 10 pontos)
  score += Math.min(factors.documentacaoIrregular * 5, 10);
  
  // Histórico ruim do posto contribui para o risco base (até 10 pontos)
  score += (factors.historicoPosto / 100) * 10;
  
  // Turnos noturnos ou de troca costumam ser mais vulneráveis (10 pontos)
  if (factors.turnoVulneravel) score += 10;

  // Normaliza o score para o range 0-100
  return Math.min(Math.round(score), 100);
}

/**
 * Retorna a faixa de risco com base no score
 */
export function getRiskBand(score: number): RiskBand {
  if (score <= 25) return 'Baixo';
  if (score <= 50) return 'Médio';
  if (score <= 75) return 'Alto';
  return 'Crítico';
}

/**
 * Retorna as classes de cor do Tailwind para a faixa de risco
 */
export function getRiskColor(band: RiskBand): string {
  switch (band) {
    case 'Baixo': return 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    case 'Médio': return 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
    case 'Alto': return 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20';
    case 'Crítico': return 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
  }
}

/**
 * Gera dados fictícios realistas para demonstração do Score
 */
export const generateMockRiskFactors = (baseRisk: 'low' | 'medium' | 'high' | 'critical' = 'medium'): RiskFactors => {
  const multiplier = baseRisk === 'low' ? 0.2 : baseRisk === 'medium' ? 0.5 : baseRisk === 'high' ? 0.8 : 1.2;
  
  return {
    ocorrenciasRecentes: Math.floor(Math.random() * 5 * multiplier),
    atrasosRonda: Math.floor(Math.random() * 4 * multiplier),
    falhasChecklist: Math.floor(Math.random() * 5 * multiplier),
    geocercaRompida: Math.random() > (1 - 0.2 * multiplier) ? 1 : 0,
    ausenciaVigilante: Math.random() > (1 - 0.1 * multiplier) ? 1 : 0,
    incidentesCriticos: Math.random() > (1 - 0.05 * multiplier) ? 1 : 0,
    falhasEquipamento: Math.floor(Math.random() * 3 * multiplier),
    documentacaoIrregular: Math.floor(Math.random() * 2 * multiplier),
    historicoPosto: Math.floor(Math.random() * 100 * multiplier),
    turnoVulneravel: Math.random() > 0.5
  };
};
