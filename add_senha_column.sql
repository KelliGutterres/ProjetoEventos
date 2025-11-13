-- Script para adicionar a coluna senha na tabela usuarios
-- Execute este script se você já criou a tabela anteriormente

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS senha VARCHAR(255) NOT NULL DEFAULT 'temp_password_change_me';

-- IMPORTANTE: Se você já tem dados na tabela, você precisa atualizar as senhas manualmente
-- ou remover a restrição DEFAULT após atualizar os registros existentes

-- Após atualizar os registros existentes, você pode remover o DEFAULT:
-- ALTER TABLE usuarios ALTER COLUMN senha DROP DEFAULT;

COMMENT ON COLUMN usuarios.senha IS 'Senha do usuário (armazenada com hash bcrypt)';

