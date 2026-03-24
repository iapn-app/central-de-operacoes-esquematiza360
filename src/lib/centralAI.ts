import { globalSystemContext } from '../../lib/ai/globalContext';

export function generateExecutiveAIResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('faturamento')) {
    return `O faturamento atual da operação é de R$ ${globalSystemContext.financeiro.faturamento.toLocaleString('pt-BR')} com lucro operacional de R$ ${globalSystemContext.financeiro.lucro.toLocaleString('pt-BR')}.`;
  }
  
  if (q.includes('frota')) {
    return `A frota atual possui ${globalSystemContext.frota.totalVeiculos} veículos. ${globalSystemContext.frota.alertaPrincipal}.`;
  }
  
  if (q.includes('risco')) {
    return `Detectamos risco crítico no ${globalSystemContext.operacional.postoCritico} que está sem comunicação há aproximadamente 30 minutos.`;
  }
  
  if (q.includes('inadimplência')) {
    return `O cliente ${globalSystemContext.financeiro.maiorClienteInadimplente} possui débito de R$ ${globalSystemContext.financeiro.inadimplenciaValor.toLocaleString('pt-BR')}.`;
  }

  return "Posso ajudar com informações financeiras, operacionais, frota ou risco da operação.";
}
