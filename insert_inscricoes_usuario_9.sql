-- Script para inserir duas inscrições para o usuário ID 9
-- Execute este script no seu banco de dados PostgreSQL
-- Certifique-se de que o usuário ID 9 existe e que existem eventos cadastrados
-- IMPORTANTE: Essas inscrições são para teste de registro de presença e envio de email

-- IMPORTANTE: Verifique a estrutura da sua tabela inscricoes
-- Se sua tabela tem 'evento_id', use os comandos abaixo
-- Se sua tabela tem 'evento_nome', veja a seção alternativa no final

-- Opção 1: Se a tabela tem evento_id (referência para tabela eventos)
-- Inserir inscrição ID 3 (para teste de presença)
INSERT INTO inscricoes (id, usuario_id, evento_id, created_at, updated_at)
VALUES (3, 9, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Inserir inscrição ID 4 (para teste de presença)
INSERT INTO inscricoes (id, usuario_id, evento_id, created_at, updated_at)
VALUES (4, 9, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Se a tabela não permite especificar o ID (auto incremento), use:
-- INSERT INTO inscricoes (usuario_id, evento_id, created_at, updated_at)
-- VALUES (9, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--
-- INSERT INTO inscricoes (usuario_id, evento_id, created_at, updated_at)
-- VALUES (9, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Opção 2: Se a tabela tem evento_nome (texto), descomente e ajuste os nomes:
-- INSERT INTO inscricoes (usuario_id, evento_nome, created_at, updated_at)
-- VALUES (9, 'Workshop de React', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--
-- INSERT INTO inscricoes (usuario_id, evento_nome, created_at, updated_at)
-- VALUES (9, 'Conferência de Tecnologia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Para verificar as inscrições criadas:
-- SELECT * FROM inscricoes WHERE usuario_id = 9;

-- Para verificar os IDs das inscrições criadas:
-- SELECT id, usuario_id, evento_id, created_at FROM inscricoes WHERE usuario_id = 9 ORDER BY id DESC;

-- Para verificar se há presenças registradas para essas inscrições:
-- SELECT p.*, i.id as inscricao_id, i.usuario_id, i.evento_id 
-- FROM presencas p 
-- RIGHT JOIN inscricoes i ON p.inscricao_id = i.id 
-- WHERE i.usuario_id = 9;

