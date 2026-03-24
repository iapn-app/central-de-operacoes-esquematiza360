import {
  getFinanceInsights,
  getFleetInsights,
  getOperationalInsights,
  getRiskInsights,
  getCostReductionInsights,
  getRhInsights,
  getContractsInsights,
} from './skills';

export function generateCentralResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('tem conta pra pagar hoje')) {
    return "Sim. Hoje a operação possui R$ 18.450 em contas a pagar e R$ 36.200 em contas a receber.";
  }
  if (q.includes('como reduzir custos na frota')) {
    return "Para reduzir custos na frota, recomendo atacar três frentes: consumo acima da média da Viatura Alpha 01, controle de combustível e revisão de manutenção preventiva. Hoje o custo médio está em R$ 0,78 por km e houve alta de 8% no combustível, o que aumenta a pressão operacional.";
  }
  if (q.includes('qual o maior risco hoje')) {
    return "O maior risco atual está concentrado no Posto Alpha, que está sem comunicação há 30 minutos. Esse evento eleva a criticidade operacional e exige validação imediata.";
  }
  if (q.includes('qual cliente está em atraso')) {
    return "O principal cliente em atraso é o Shopping Center Sul, com inadimplência de R$ 120.000.";
  }
  if (q.includes('como está a operação hoje')) {
    return "A operação mantém 24 postos ativos, 142 vigilantes e 7 ocorrências registradas hoje. Existem 2 alertas críticos, com maior atenção voltada ao Posto Alpha e ao eixo Oeste.";
  }
  if (q.includes('onde devo agir primeiro')) {
    return "Minha prioridade executiva seria agir primeiro no Posto Alpha por conta da falha de comunicação, em seguida analisar o desempenho da Viatura Alpha 01 e a inadimplência do Shopping Center Sul.";
  }

  if (['faturamento', 'receita', 'lucro', 'contas', 'pagar', 'receber', 'financeiro', 'inadimplência', 'débito', 'atraso'].some(word => q.includes(word))) {
    return getFinanceInsights();
  }
  if (['frota', 'veículo', 'carro', 'viatura', 'combustível', 'km', 'manutenção', 'consumo'].some(word => q.includes(word))) {
    return getFleetInsights();
  }
  if (['custo', 'reduzir custo', 'economia', 'gasto', 'folha', 'combustível caro'].some(word => q.includes(word))) {
    return getCostReductionInsights();
  }
  if (['posto', 'vigilante', 'operação', 'ocorrência', 'ronda', 'supervisor'].some(word => q.includes(word))) {
    return getOperationalInsights();
  }
  if (['risco', 'crítico', 'alerta', 'tendência', 'mapa de risco', 'falha de comunicação'].some(word => q.includes(word))) {
    return getRiskInsights();
  }
  if (['treinamento', 'funcionários', 'colaboradores', 'rh', 'performance', 'score'].some(word => q.includes(word))) {
    return getRhInsights();
  }
  if (['contrato', 'cliente', 'renovação', 'shopping center sul'].some(word => q.includes(word))) {
    return getContractsInsights();
  }

  return "Analisei o contexto atual da Esquematiza Central 360°. Posso ajudar com informações sobre financeiro, frota, custos, operacional, risco, RH ou contratos.";
}
