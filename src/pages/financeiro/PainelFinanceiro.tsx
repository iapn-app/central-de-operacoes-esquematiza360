// SUBSTITUA APENAS ESSAS DUAS FUNÇÕES NO SEU ARQUIVO

function isReceita(item: any) {
  const tipo = getItemTipo(item);

  if ([
    'income',
    'receita',
    'entrada',
    'receivable',
    'credito',
    'crédito'
  ].includes(tipo)) {
    return true;
  }

  const valor = getItemValor(item);
  return valor > 0;
}

function isDespesa(item: any) {
  const tipo = getItemTipo(item);

  if ([
    'expense',
    'despesa',
    'saida',
    'saída',
    'payable',
    'debito',
    'débito'
  ].includes(tipo)) {
    return true;
  }

  const valor = getItemValor(item);
  return valor < 0;
}
