-- Script para adicionar a coluna admin na tabela usuarios
-- Execute este script no seu banco de dados PostgreSQL

-- Adicionar coluna admin (booleano, padrão false)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS admin BOOLEAN DEFAULT false NOT NULL;

-- Comentário sobre a coluna
COMMENT ON COLUMN usuarios.admin IS 'Indica se o usuário é administrador (true) ou usuário normal (false)';

-- Criar índice para melhor performance nas buscas por admin (opcional, mas útil)
CREATE INDEX IF NOT EXISTS idx_usuarios_admin ON usuarios(admin) WHERE admin = true;

-- Exemplo: Para tornar um usuário existente como admin, execute:
-- UPDATE usuarios SET admin = true WHERE email = 'admin@exemplo.com';

