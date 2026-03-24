import { globalSystemContext } from './globalContext';

export function getFinanceInsights(): string {
  const ctx = globalSystemContext.financeiro;
  return `O faturamento atual é de R$ ${ctx.faturamento.toLocaleString('pt-BR')}, com lucro operacional de R$ ${ctx.lucro.toLocaleString('pt-BR')}. A inadimplência total está em R$ ${ctx.inadimplenciaValor.toLocaleString('pt-BR')}, concentrada no ${ctx.maiorClienteInadimplente}. Hoje há R$ ${ctx.contasPagarHoje.toLocaleString('pt-BR')} em contas a pagar e R$ ${ctx.contasReceberHoje.toLocaleString('pt-BR')} em contas a receber.`;
}

export function getFleetInsights(): string {
  const ctx = globalSystemContext.frota;
  return `A frota possui ${ctx.totalVeiculos} veículos ativos, com custo médio de R$ ${ctx.custoMedioKm.toFixed(2).replace('.', ',')} por km e aumento recente de ${ctx.aumentoCombustivelPercentual}% no combustível. O principal ponto de atenção é a ${ctx.alertaPrincipal}.`;
}

export function getOperationalInsights(): string {
  const ctx = globalSystemContext.operacional;
  return `Atualmente operamos com ${ctx.postosAtivos} postos ativos e ${ctx.vigilantes} vigilantes. Registramos ${ctx.ocorrenciasHoje} ocorrências hoje (${ctx.ocorrenciasMes} no mês). O posto crítico no momento é o ${ctx.postoCritico}.`;
}

export function getRiskInsights(): string {
  const ctx = globalSystemContext.risco;
  return `O nível de risco atual é ${ctx.nivelAtual}, com tendência de ${ctx.tendencia72h} nas próximas 72 horas. Sinais relevantes: ${ctx.sinaisRelevantes.join(', ')}. Postos em observação: ${ctx.postosObservacao.join(', ')}.`;
}

export function getCostReductionInsights(): string {
  const ctx = globalSystemContext.custos;
  return `A principal pressão de custo está na ${ctx.maiorPressaoCusto}, que representa ${ctx.folhaPagamentoPercentual}% do total de R$ ${ctx.totalCustos.toLocaleString('pt-BR')}. Para reduzir custos, recomendo revisar horas extras, redistribuição de cobertura em postos de menor performance e análise de produtividade operacional. Combustível (${ctx.combustivelPercentual}%) e manutenção (${ctx.manutencaoPercentual}%) também exigem monitoramento.`;
}

export function getRhInsights(): string {
  const ctx = globalSystemContext.rh;
  return `A operação conta com ${ctx.colaboradores} colaboradores e ${ctx.treinamentosAtivos} treinamentos ativos. O progresso médio dos treinamentos é de ${ctx.progressoMedioTreinamentos}% e o score médio de performance da equipe é de ${ctx.scoreMedioPerformance}.`;
}

export function getContractsInsights(): string {
  const ctx = globalSystemContext.contratos;
  const inad = globalSystemContext.financeiro;
  return `Temos ${ctx.ativos} contratos ativos. O principal contrato é com ${ctx.principalContrato} (valor de R$ ${ctx.valorPrincipalContrato.toLocaleString('pt-BR')}). A próxima renovação importante é ${ctx.proximaRenovacao}. Vale notar que a inadimplência relacionada ao maior cliente inadimplente (${inad.maiorClienteInadimplente}) requer atenção.`;
}
