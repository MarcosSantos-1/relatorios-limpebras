-- Migração inicial do banco de dados
-- Sistema de Relatórios da Prefeitura

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_servico VARCHAR(50) NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    data_relatorio DATE NOT NULL,
    sub_regiao VARCHAR(10),
    local VARCHAR(500),
    descricao TEXT,
    dados_jsonb JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fotos/evidências
CREATE TABLE IF NOT EXISTS evidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID REFERENCES relatorios(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    etapa VARCHAR(20), -- 'ANTES', 'DURANTE', 'DEPOIS'
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de PDFs gerados
CREATE TABLE IF NOT EXISTS pdfs_gerados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID REFERENCES relatorios(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    tipo_geracao VARCHAR(50) NOT NULL, -- 'individual', 'consolidado'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de documentos (para uploads gerais)
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'PDF', 'EXCEL', 'IMAGEM'
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de anotações
CREATE TABLE IF NOT EXISTS anotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    blocks JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de acumuladores (planejamento)
CREATE TABLE IF NOT EXISTS acumuladores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_regiao VARCHAR(10) NOT NULL,
    dia DATE NOT NULL,
    hora TIME NOT NULL,
    endereco VARCHAR(500) NOT NULL,
    sei VARCHAR(100) NOT NULL,
    placa_veiculo VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'nao_comecou',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de eventos (planejamento)
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    sub_regiao VARCHAR(10) NOT NULL,
    dia DATE NOT NULL,
    hora TIME NOT NULL,
    endereco VARCHAR(500) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'evento', 'reuniao', 'outros'
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_relatorios_user_id ON relatorios(user_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_tipo_servico ON relatorios(tipo_servico);
CREATE INDEX IF NOT EXISTS idx_relatorios_data ON relatorios(data_relatorio);
CREATE INDEX IF NOT EXISTS idx_relatorios_sub_regiao ON relatorios(sub_regiao);
CREATE INDEX IF NOT EXISTS idx_evidencias_relatorio_id ON evidencias(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_relatorio_id ON pdfs_gerados(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_documentos_user_id ON documentos(user_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_user_id ON anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_acumuladores_dia ON acumuladores(dia);
CREATE INDEX IF NOT EXISTS idx_eventos_dia ON eventos(dia);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_relatorios_updated_at BEFORE UPDATE ON relatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anotacoes_updated_at BEFORE UPDATE ON anotacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acumuladores_updated_at BEFORE UPDATE ON acumuladores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
