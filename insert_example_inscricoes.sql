-- Script para inserir dados de exemplo de inscrições
-- Execute este script após criar as tabelas e ter usuários cadastrados
-- Ajuste os IDs dos usuários conforme seus dados reais

-- Exemplo de inserção de inscrições
-- Substitua os valores de usuario_id pelos IDs reais dos seus usuários

INSERT INTO inscricoes (usuario_id, evento_nome) VALUES
(1, 'Workshop de JavaScript'),
(1, 'Conferência de Tecnologia'),
(2, 'Workshop de JavaScript'),
(2, 'Meetup de Desenvolvimento');

-- Para verificar as inscrições criadas:
-- SELECT * FROM inscricoes;

-- Para verificar as presenças:
-- SELECT * FROM presencas;

