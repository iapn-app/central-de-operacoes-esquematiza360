import { globalSystemContext } from './globalContext';

export function serializeExecutiveContext(): string {
  const ctx = globalSystemContext;
  return `Contexto atual da operação Esquematiza Central 360°:

Financeiro:
- Faturamento atual de R$ ${ctx.financeiro.faturamento.toLocaleString('pt-BR')}
- Receita recebida de R$ ${ctx.financeiro.receitaRecebida.toLocaleString('pt-BR')}
- Lucro operacional de R$ ${ctx.financeiro.lucro.toLocaleString('pt-BR')}
- Inadimplência total de R$ ${ctx.financeiro.inadimplenciaValor.toLocaleString('pt-BR')} (${ctx.financeiro.inadimplenciaPercentual}%)
- Contas a pagar hoje: R$ ${ctx.financeiro.contasPagarHoje.toLocaleString('pt-BR')}
- Contas a receber hoje: R$ ${ctx.financeiro.contasReceberHoje.toLocaleString('pt-BR')}
- Maior cliente inadimplente: ${ctx.financeiro.maiorClienteInadimplente}

Frota:
- ${ctx.frota.totalVeiculos} veículos ativos
- Custo médio de R$ ${ctx.frota.custoMedioKm.toFixed(2).replace('.', ',')} por km
- Aumento de combustível de ${ctx.frota.aumentoCombustivelPercentual}%
- Alerta principal: ${ctx.frota.alertaPrincipal}
- ${ctx.frota.veiculosEmAlerta} veículos em alerta
- Disponibilidade da frota em ${ctx.frota.disponibilidadeFrota}%

Operacional:
- ${ctx.operacional.postosAtivos} postos ativos
- ${ctx.operacional.vigilantes} vigilantes
- ${ctx.operacional.ocorrenciasMes} ocorrências no mês
- ${ctx.operacional.ocorrenciasHoje} ocorrências hoje
- ${ctx.operacional.alertasCriticos} alertas críticos
- Posto crítico: ${ctx.operacional.postoCritico}
- Risco crítico: ${ctx.operacional.riscoCritico}
- Setor mais sensível: ${ctx.operacional.setorMaisSensivel}

RH:
- ${ctx.rh.colaboradores} colaboradores
- ${ctx.rh.treinamentosAtivos} treinamentos ativos
- Progresso médio de ${ctx.rh.progressoMedioTreinamentos}%
- ${ctx.rh.colaboradoresEmAlerta} colaboradores em alerta
- Score médio de performance: ${ctx.rh.scoreMedioPerformance}

Contratos:
- ${ctx.contratos.ativos} ativos
- Principal contrato: ${ctx.contratos.principalContrato}
- Valor principal contrato: R$ ${ctx.contratos.valorPrincipalContrato.toLocaleString('pt-BR')}
- Próxima renovação: ${ctx.contratos.proximaRenovacao}

Custos:
- Custos totais de R$ ${ctx.custos.totalCustos.toLocaleString('pt-BR')}
- Folha de pagamento representa ${ctx.custos.folhaPagamentoPercentual}%
- Combustível representa ${ctx.custos.combustivelPercentual}%
- Manutenção representa ${ctx.custos.manutencaoPercentual}%
- Principal pressão de custo: ${ctx.custos.maiorPressaoCusto}

Risco:
- Nível atual ${ctx.risco.nivelAtual}
- Tendência de ${ctx.risco.tendencia72h} nas próximas 72 horas
- Postos em observação: ${ctx.risco.postosObservacao.join(', ')}
- Sinais relevantes: ${ctx.risco.sinaisRelevantes.join(', ')}`;
}
