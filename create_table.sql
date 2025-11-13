-- Script para criar a tabela de usuários
-- Execute este script no seu banco de dados PostgreSQL

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cidade VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance nas buscas por email e cpf
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);

-- Comentários sobre a tabela
COMMENT ON TABLE usuarios IS 'Tabela para armazenar informações dos usuários do sistema de eventos';
COMMENT ON COLUMN usuarios.id IS 'ID único do usuário (auto incremento)';
COMMENT ON COLUMN usuarios.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN usuarios.email IS 'E-mail do usuário (único)';
COMMENT ON COLUMN usuarios.cpf IS 'CPF do usuário (único, sem formatação)';
COMMENT ON COLUMN usuarios.data_nascimento IS 'Data de nascimento do usuário';
COMMENT ON COLUMN usuarios.senha IS 'Senha do usuário (armazenada com hash bcrypt)';
COMMENT ON COLUMN usuarios.cidade IS 'Cidade onde o usuário reside';

