-- MÓDULO FINANCEIRO - SISTEMA 360
-- Estrutura de banco de dados para Fase 1 (MVP)

-- Habilitar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONTRATOS
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL, -- Referência à tabela de clientes existente
    tipo_servico VARCHAR(50) NOT NULL, -- Vigilância, Limpeza, Jardinagem, Multi-serviço
    valor_mensal DECIMAL(12,2) NOT NULL,
    quantidade_profissionais INT DEFAULT 1,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    frequencia VARCHAR(20) DEFAULT 'Mensal', -- Mensal, Anual, Única
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, FINALIZADO, PAUSADO
    operacao_id UUID, -- Referência à tabela de operações/cidades
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FATURAS
CREATE TABLE IF NOT EXISTS faturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_nf VARCHAR(50) UNIQUE,
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ABERTA', -- ABERTA, PAGA, ATRASADA, CANCELADA
    metodo_pagamento VARCHAR(50), -- Boleto, PIX, Transferência
    data_pagamento DATE,
    juros_calculados DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS contas_receber (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    dias_atraso INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, PAGO, ATRASADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DESPESAS (CONTAS A PAGAR)
CREATE TABLE IF NOT EXISTS despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- Salário, Combustível, Impostos, Fornecedores
    data_vencimento DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, PAGO, AGENDADO
    metodo_pagamento VARCHAR(50),
    operacao_id UUID,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ALOCAÇÃO DE CUSTOS POR SERVIÇO
CREATE TABLE IF NOT EXISTS alocacao_custos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despesa_id UUID NOT NULL REFERENCES despesas(id) ON DELETE CASCADE,
    servico VARCHAR(50) NOT NULL, -- Vigilância, Limpeza, Jardinagem
    percentual_alocacao DECIMAL(5,2) NOT NULL CHECK (percentual_alocacao > 0 AND percentual_alocacao <= 100),
    valor_alocado DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_faturas_updated_at BEFORE UPDATE ON faturas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON despesas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
