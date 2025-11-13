const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @swagger
 * /api/presencas:
 *   post:
 *     summary: Confirmar presença de um usuário
 *     description: Registra a presença de um usuário baseado no ID da inscrição. A presença só é confirmada se a inscrição existir.
 *     tags: [Presenças]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresencaRequest'
 *           examples:
 *             exemplo1:
 *               summary: Confirmar presença com inscrição válida
 *               value:
 *                 inscricao_id: 1
 *             exemplo2:
 *               summary: Tentativa de confirmar presença
 *               value:
 *                 inscricao_id: 5
 *     responses:
 *       200:
 *         description: Presença confirmada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresencaSuccessResponse'
 *             example:
 *               success: true
 *               message: "Presença confirmada com sucesso"
 *               presenca_confirmada: true
 *               data:
 *                 id: 1
 *                 inscricao_id: 1
 *                 confirmada: true
 *                 data_presenca: "2024-01-15T14:30:00.000Z"
 *                 created_at: "2024-01-15T14:30:00.000Z"
 *       404:
 *         description: Inscrição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresencaErrorResponse'
 *             example:
 *               success: false
 *               message: "Inscrição não encontrada"
 *               presenca_confirmada: false
 *       400:
 *         description: Erro de validação - ID da inscrição obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresencaErrorResponse'
 *             example:
 *               success: false
 *               message: "ID da inscrição é obrigatório"
 *               presenca_confirmada: false
 *       409:
 *         description: Conflito - Presença já confirmada para esta inscrição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresencaErrorResponse'
 *             example:
 *               success: false
 *               message: "Presença já confirmada para esta inscrição"
 *               presenca_confirmada: false
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresencaErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor ao confirmar presença"
 *               presenca_confirmada: false
 */
router.post('/', async (req, res) => {
  const { inscricao_id } = req.body;

  // Validação do campo obrigatório
  if (!inscricao_id) {
    return res.status(400).json({
      success: false,
      message: 'ID da inscrição é obrigatório',
      presenca_confirmada: false
    });
  }

  // Validação do tipo do ID
  if (typeof inscricao_id !== 'number' || inscricao_id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID da inscrição deve ser um número positivo',
      presenca_confirmada: false
    });
  }

  try {
    // Verificar se a inscrição existe
    const inscricaoCheck = await pool.query(
      'SELECT id, usuario_id, evento_id FROM inscricoes WHERE id = $1',
      [inscricao_id]
    );

    if (inscricaoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada',
        presenca_confirmada: false
      });
    }

    // Verificar se a presença já foi confirmada
    const presencaCheck = await pool.query(
      'SELECT id FROM presencas WHERE inscricao_id = $1',
      [inscricao_id]
    );

    if (presencaCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Presença já confirmada para esta inscrição',
        presenca_confirmada: false
      });
    }

    // Registrar a presença
    const result = await pool.query(
      `INSERT INTO presencas (inscricao_id) 
       VALUES ($1) 
       RETURNING id, inscricao_id, created_at`,
      [inscricao_id]
    );

    res.status(200).json({
      success: true,
      message: 'Presença confirmada com sucesso',
      presenca_confirmada: true,
      data: {
        id: result.rows[0].id,
        inscricao_id: result.rows[0].inscricao_id,
        confirmada: true,
        data_presenca: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao confirmar presença',
      presenca_confirmada: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

