-- Script para adicionar a coluna cidade na tabela usuarios
-- Execute este script se você já criou a tabela anteriormente

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cidade VARCHAR(255);

COMMENT ON COLUMN usuarios.cidade IS 'Cidade onde o usuário reside';

