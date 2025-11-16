const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Autenticar usuário
 *     description: Valida as credenciais (e-mail e senha) do usuário e retorna se está autorizado para autenticar
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             exemplo1:
 *               summary: Login válido
 *               value:
 *                 email: "joao.silva@email.com"
 *                 senha: "senha123"
 *             exemplo2:
 *               summary: Tentativa de login
 *               value:
 *                 email: "maria.santos@email.com"
 *                 senha: "senhaSegura123"
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *             example:
 *               success: true
 *               message: "Usuário autenticado com sucesso"
 *               authorized: true
 *               data:
 *                 id: 1
 *                 nome: "João Silva"
 *                 email: "joao.silva@email.com"
 *       401:
 *         description: Credenciais inválidas - E-mail ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 *             examples:
 *               usuarioNaoEncontrado:
 *                 summary: Usuário não encontrado
 *                 value:
 *                   success: false
 *                   message: "E-mail ou senha incorretos"
 *                   authorized: false
 *               senhaIncorreta:
 *                 summary: Senha incorreta
 *                 value:
 *                   success: false
 *                   message: "E-mail ou senha incorretos"
 *                   authorized: false
 *       400:
 *         description: Erro de validação - Campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 *             example:
 *               success: false
 *               message: "E-mail e senha são obrigatórios"
 *               authorized: false
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor ao autenticar usuário"
 *               authorized: false
 */
router.post('/', async (req, res) => {
  const { email, senha } = req.body;

  // Validação dos campos obrigatórios
  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'E-mail e senha são obrigatórios',
      authorized: false
    });
  }

  // Validação de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de e-mail inválido',
      authorized: false
    });
  }

  try {
    // Buscar usuário pelo email
    const result = await pool.query(
      'SELECT id, nome, email, cpf, data_nascimento, senha FROM usuarios WHERE email = $1',
      [email]
    );

    // Verificar se usuário existe
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos',
        authorized: false
      });
    }

    const usuario = result.rows[0];

    // Comparar senha fornecida com a senha hash armazenada
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos',
        authorized: false
      });
    }

    // Autenticação bem-sucedida
    // Remover senha do objeto antes de retornar
    const { senha: _, ...usuarioSemSenha } = usuario;

    // Token fixo para autenticação
    const TOKEN = '12345';

    res.status(200).json({
      success: true,
      message: 'Usuário autenticado com sucesso',
      authorized: true,
      token: TOKEN,
      data: usuarioSemSenha
    });

  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao autenticar usuário',
      authorized: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

