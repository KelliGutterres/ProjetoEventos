-- Script para criar as tabelas de inscrições e presenças
-- Execute este script no seu banco de dados PostgreSQL

-- Tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_nome VARCHAR(255) NOT NULL,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de presenças
CREATE TABLE IF NOT EXISTS presencas (
    id SERIAL PRIMARY KEY,
    inscricao_id INTEGER NOT NULL REFERENCES inscricoes(id) ON DELETE CASCADE,
    confirmada BOOLEAN DEFAULT TRUE,
    data_presenca TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inscricao_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario ON inscricoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_presencas_inscricao ON presencas(inscricao_id);

-- Comentários sobre as tabelas
COMMENT ON TABLE inscricoes IS 'Tabela para armazenar as inscrições dos usuários em eventos';
COMMENT ON COLUMN inscricoes.id IS 'ID único da inscrição (auto incremento)';
COMMENT ON COLUMN inscricoes.usuario_id IS 'ID do usuário que realizou a inscrição';
COMMENT ON COLUMN inscricoes.evento_nome IS 'Nome do evento em que o usuário se inscreveu';

COMMENT ON TABLE presencas IS 'Tabela para armazenar as presenças confirmadas dos usuários';
COMMENT ON COLUMN presencas.id IS 'ID único da presença (auto incremento)';
COMMENT ON COLUMN presencas.inscricao_id IS 'ID da inscrição relacionada (único)';
COMMENT ON COLUMN presencas.confirmada IS 'Status de confirmação da presença (sempre TRUE quando registrada)';
COMMENT ON COLUMN presencas.data_presenca IS 'Data e hora da confirmação da presença';

