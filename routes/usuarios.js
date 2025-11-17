const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Criar um novo usuário
 *     description: Cadastra um novo usuário no sistema com validações de dados e criptografia de senha
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *           examples:
 *             exemplo1:
 *               summary: Exemplo de criação de usuário
 *               value:
 *                 nome: "João Silva"
 *                 email: "joao.silva@email.com"
 *                 cpf: "12345678901"
 *                 data_nascimento: "1990-05-15"
 *                 senha: "senha123"
 *                 cidade: "São Paulo"
 *             exemplo2:
 *               summary: Exemplo com CPF formatado
 *               value:
 *                 nome: "Maria Santos"
 *                 email: "maria.santos@email.com"
 *                 cpf: "987.654.321-00"
 *                 data_nascimento: "1985-03-20"
 *                 senha: "senhaSegura123"
 *                 cidade: "Rio de Janeiro"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Usuário criado com sucesso"
 *               data:
 *                 id: 1
 *                 nome: "João Silva"
 *                 email: "joao.silva@email.com"
 *                 cpf: "12345678901"
 *                 data_nascimento: "1990-05-15"
 *                 cidade: "São Paulo"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Erro de validação - Campos obrigatórios ou formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               camposObrigatorios:
 *                 summary: Campos obrigatórios faltando
 *                 value:
 *                   success: false
 *                   message: "Todos os campos são obrigatórios: nome, email, cpf, data_nascimento, senha"
 *               emailInvalido:
 *                 summary: Formato de e-mail inválido
 *                 value:
 *                   success: false
 *                   message: "Formato de e-mail inválido"
 *               cpfInvalido:
 *                 summary: CPF com formato inválido
 *                 value:
 *                   success: false
 *                   message: "CPF deve conter 11 dígitos"
 *               senhaFraca:
 *                 summary: Senha muito curta
 *                 value:
 *                   success: false
 *                   message: "A senha deve conter no mínimo 6 caracteres"
 *               dataInvalida:
 *                 summary: Data de nascimento inválida
 *                 value:
 *                   success: false
 *                   message: "Data de nascimento inválida. Use o formato YYYY-MM-DD"
 *       409:
 *         description: Conflito - E-mail ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emailDuplicado:
 *                 summary: E-mail já cadastrado
 *                 value:
 *                   success: false
 *                   message: "E-mail já cadastrado no sistema"
 *               cpfDuplicado:
 *                 summary: CPF já cadastrado
 *                 value:
 *                   success: false
 *                   message: "CPF já cadastrado no sistema"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor ao criar usuário"
 */
router.post('/', async (req, res) => {
  const { nome, email, cpf, data_nascimento, senha, cidade } = req.body;

  // Validação dos campos obrigatórios
  if (!nome || !email || !cpf || !data_nascimento || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios: nome, email, cpf, data_nascimento, senha'
    });
  }

  // Validação de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de e-mail inválido'
    });
  }

  // Validação de CPF (deve ter 11 dígitos)
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    return res.status(400).json({
      success: false,
      message: 'CPF deve conter 11 dígitos'
    });
  }

  // Validação de data de nascimento
  const dataNascimento = new Date(data_nascimento);
  if (isNaN(dataNascimento.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Data de nascimento inválida. Use o formato YYYY-MM-DD'
    });
  }

  // Validação de senha (mínimo 6 caracteres)
  if (senha.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'A senha deve conter no mínimo 6 caracteres'
    });
  }

  try {
    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'E-mail já cadastrado no sistema'
      });
    }

    // Verificar se CPF já existe
    const cpfCheck = await pool.query(
      'SELECT id FROM usuarios WHERE cpf = $1',
      [cpfLimpo]
    );

    if (cpfCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'CPF já cadastrado no sistema'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Inserir novo usuário (admin será false por padrão)
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, cpf, data_nascimento, senha, cidade) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, nome, email, cpf, data_nascimento, cidade, admin, created_at`,
      [nome, email, cpfLimpo, data_nascimento, senhaHash, cidade || null]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

