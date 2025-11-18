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

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualizar um usuário existente
 *     description: Atualiza os dados de um usuário existente. Todos os campos são opcionais, mas se fornecidos serão validados. A senha só será atualizada se fornecida.
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser atualizado
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-mail do usuário
 *                 example: "joao.silva@email.com"
 *               cpf:
 *                 type: string
 *                 description: CPF do usuário (aceita formatado ou não)
 *                 example: "12345678901"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento no formato YYYY-MM-DD
 *                 example: "1990-05-15"
 *               senha:
 *                 type: string
 *                 description: Nova senha (opcional, mínimo 6 caracteres)
 *                 example: "novaSenha123"
 *               cidade:
 *                 type: string
 *                 description: Cidade do usuário
 *                 example: "São Paulo"
 *           examples:
 *             exemplo1:
 *               summary: Atualizar todos os campos
 *               value:
 *                 nome: "João Silva Atualizado"
 *                 email: "joao.silva.novo@email.com"
 *                 cpf: "12345678901"
 *                 data_nascimento: "1990-05-15"
 *                 senha: "novaSenha123"
 *                 cidade: "Rio de Janeiro"
 *             exemplo2:
 *               summary: Atualizar apenas nome e cidade
 *               value:
 *                 nome: "João Silva"
 *                 cidade: "Brasília"
 *             exemplo3:
 *               summary: Atualizar apenas senha
 *               value:
 *                 senha: "novaSenhaSegura123"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Usuário atualizado com sucesso"
 *               data:
 *                 id: 1
 *                 nome: "João Silva Atualizado"
 *                 email: "joao.silva.novo@email.com"
 *                 cpf: "12345678901"
 *                 data_nascimento: "1990-05-15"
 *                 cidade: "Rio de Janeiro"
 *                 admin: false
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Erro de validação - Formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
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
 *               nenhumCampo:
 *                 summary: Nenhum campo fornecido
 *                 value:
 *                   success: false
 *                   message: "Pelo menos um campo deve ser fornecido para atualização"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuário não encontrado"
 *       409:
 *         description: Conflito - E-mail ou CPF já cadastrado em outro usuário
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
 *               message: "Erro interno do servidor ao atualizar usuário"
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, cpf, data_nascimento, senha, cidade } = req.body;

  // Verificar se pelo menos um campo foi fornecido
  if (!nome && !email && !cpf && !data_nascimento && !senha && cidade === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Pelo menos um campo deve ser fornecido para atualização'
    });
  }

  try {
    // Verificar se o usuário existe
    const usuarioCheck = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Validação de formato de email (se fornecido)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de e-mail inválido'
        });
      }

      // Verificar se email já existe em outro usuário
      const emailCheck = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já cadastrado no sistema'
        });
      }
    }

    // Validação de CPF (se fornecido)
    let cpfLimpo = null;
    if (cpf) {
      cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({
          success: false,
          message: 'CPF deve conter 11 dígitos'
        });
      }

      // Verificar se CPF já existe em outro usuário
      const cpfCheck = await pool.query(
        'SELECT id FROM usuarios WHERE cpf = $1 AND id != $2',
        [cpfLimpo, id]
      );

      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado no sistema'
        });
      }
    }

    // Validação de data de nascimento (se fornecida)
    if (data_nascimento) {
      const dataNascimento = new Date(data_nascimento);
      if (isNaN(dataNascimento.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento inválida. Use o formato YYYY-MM-DD'
        });
      }
    }

    // Validação de senha (se fornecida)
    let senhaHash = null;
    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve conter no mínimo 6 caracteres'
        });
      }
      const saltRounds = 10;
      senhaHash = await bcrypt.hash(senha, saltRounds);
    }

    // Construir query dinamicamente baseado nos campos fornecidos
    const campos = [];
    const valores = [];
    let paramIndex = 1;

    if (nome) {
      campos.push(`nome = $${paramIndex}`);
      valores.push(nome);
      paramIndex++;
    }

    if (email) {
      campos.push(`email = $${paramIndex}`);
      valores.push(email);
      paramIndex++;
    }

    if (cpfLimpo) {
      campos.push(`cpf = $${paramIndex}`);
      valores.push(cpfLimpo);
      paramIndex++;
    }

    if (data_nascimento) {
      campos.push(`data_nascimento = $${paramIndex}`);
      valores.push(data_nascimento);
      paramIndex++;
    }

    if (senhaHash) {
      campos.push(`senha = $${paramIndex}`);
      valores.push(senhaHash);
      paramIndex++;
    }

    if (cidade !== undefined) {
      campos.push(`cidade = $${paramIndex}`);
      valores.push(cidade || null);
      paramIndex++;
    }

    // Adicionar o ID como último parâmetro
    valores.push(id);

    // Executar atualização
    const updateQuery = `
      UPDATE usuarios 
      SET ${campos.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, nome, email, cpf, data_nascimento, cidade, admin, created_at
    `;

    const result = await pool.query(updateQuery, valores);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

