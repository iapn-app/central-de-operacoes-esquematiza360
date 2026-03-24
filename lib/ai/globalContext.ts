import { sharedEntities } from '../mock/sharedEntities';

export const globalSystemContext = {
  financeiro: {
    faturamento: 1248500,
    receitaRecebida: 1180000,
    lucro: 468500,
    inadimplenciaValor: 120000,
    inadimplenciaPercentual: 8.5,
    contasPagarHoje: 18450,
    contasReceberHoje: 36200,
    maiorClienteInadimplente: sharedEntities.clientes[0]
  },

  frota: {
    totalVeiculos: 24,
    custoMedioKm: 0.78,
    aumentoCombustivelPercentual: 8,
    alertaPrincipal: `${sharedEntities.veiculos[0]} com consumo acima da média`,
    veiculosEmAlerta: 3,
    disponibilidadeFrota: 91
  },

  operacional: {
    postosAtivos: 24,
    vigilantes: 142,
    ocorrenciasMes: 17,
    ocorrenciasHoje: 7,
    alertasCriticos: 2,
    postoCritico: sharedEntities.postos[0],
    riscoCritico: `${sharedEntities.postos[0]} sem comunicação há 30 minutos`,
    setorMaisSensivel: "Eixo Oeste"
  },

  rh: {
    colaboradores: 142,
    treinamentosAtivos: 3,
    progressoMedioTreinamentos: 82,
    colaboradoresEmAlerta: 6,
    scoreMedioPerformance: 84
  },

  contratos: {
    ativos: sharedEntities.clientes.length,
    principalContrato: sharedEntities.clientes[0],
    valorPrincipalContrato: 120000,
    proximaRenovacao: `${sharedEntities.clientes[1]} - 2026-08-15`
  },

  custos: {
    totalCustos: 780000,
    folhaPagamentoPercentual: 57.7,
    combustivelPercentual: 14.2,
    manutencaoPercentual: 9.8,
    maiorPressaoCusto: "Folha de Pagamento"
  },

  risco: {
    nivelAtual: "Moderado",
    tendencia72h: "+18%",
    postosObservacao: [sharedEntities.postos[0], sharedEntities.clientes[0], sharedEntities.clientes[2]],
    sinaisRelevantes: [
      "falha de comunicação",
      "aumento de ocorrência noturna",
      "atraso de ronda",
      "baixa cobertura operacional"
    ]
  }
};
