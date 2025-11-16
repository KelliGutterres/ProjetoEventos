const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Eventos',
      version: '1.0.0',
      description: 'API REST para gerenciamento de eventos com PostgreSQL',
      contact: {
        name: 'Suporte API',
        email: 'suporte@projetoeventos.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.projetoeventos.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Token',
          description: 'Token de autenticação fixo: 12345'
        }
      },
      schemas: {
        PresencaRequest: {
          type: 'object',
          required: ['inscricao_id'],
          properties: {
            inscricao_id: {
              type: 'integer',
              description: 'ID da inscrição que terá a presença confirmada',
              example: 1
            }
          }
        },
        PresencaResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da presença',
              example: 1
            },
            inscricao_id: {
              type: 'integer',
              description: 'ID da inscrição relacionada',
              example: 1
            },
            confirmada: {
              type: 'boolean',
              description: 'Status de confirmação da presença (sempre true quando registrada)',
              example: true
            },
            data_presenca: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da confirmação da presença (usando created_at)',
              example: '2024-01-15T14:30:00.000Z'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de criação do registro',
              example: '2024-01-15T14:30:00.000Z'
            }
          }
        },
        PresencaSuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Presença confirmada com sucesso'
            },
            presenca_confirmada: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/PresencaResponse'
            }
          }
        },
        PresencaErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Inscrição não encontrada'
            },
            presenca_confirmada: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Detalhes do erro (apenas em desenvolvimento)',
              example: 'Validation error details'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'E-mail do usuário',
              example: 'joao.silva@email.com'
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário',
              example: 'senha123'
            }
          }
        },
        AuthSuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Usuário autenticado com sucesso'
            },
            authorized: {
              type: 'boolean',
              example: true
            },
            token: {
              type: 'string',
              description: 'Token de autenticação para usar nas requisições protegidas',
              example: '12345'
            },
            data: {
              $ref: '#/components/schemas/UsuarioResponse'
            }
          }
        },
        AuthErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'E-mail ou senha incorretos'
            },
            authorized: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Detalhes do erro (apenas em desenvolvimento)',
              example: 'Validation error details'
            }
          }
        },
        Usuario: {
          type: 'object',
          required: ['nome', 'email', 'cpf', 'data_nascimento', 'senha'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-mail do usuário (único)',
              example: 'joao.silva@email.com'
            },
            cpf: {
              type: 'string',
              description: 'CPF do usuário (11 dígitos, com ou sem formatação)',
              example: '12345678901'
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              description: 'Data de nascimento no formato YYYY-MM-DD',
              example: '1990-05-15'
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário (mínimo 6 caracteres)',
              example: 'senha123',
              minLength: 6
            },
            cidade: {
              type: 'string',
              description: 'Cidade onde o usuário reside',
              example: 'São Paulo'
            }
          }
        },
        UsuarioResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário (gerado automaticamente)',
              example: 1
            },
            nome: {
              type: 'string',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao.silva@email.com'
            },
            cpf: {
              type: 'string',
              example: '12345678901'
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              example: '1990-05-15'
            },
            cidade: {
              type: 'string',
              example: 'São Paulo'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Usuário criado com sucesso'
            },
            data: {
              $ref: '#/components/schemas/UsuarioResponse'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Todos os campos são obrigatórios: nome, email, cpf, data_nascimento, senha'
            },
            error: {
              type: 'string',
              description: 'Detalhes do erro (apenas em desenvolvimento)',
              example: 'Validation error details'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Usuários',
        description: 'Endpoints para gerenciamento de usuários'
      },
      {
        name: 'Autenticação',
        description: 'Endpoints para autenticação de usuários'
      },
      {
        name: 'Presenças',
        description: 'Endpoints para gerenciamento de presenças em eventos'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

