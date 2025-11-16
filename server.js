const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const usuariosRoutes = require('./routes/usuarios');
const authRoutes = require('./routes/auth');
const presencasRoutes = require('./routes/presencas');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper para adicionar headers CORS em todas as respostas
const addCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  
  // Se usar credentials, não pode usar * - precisa especificar a origem
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};

// CORS - Permitir requisições do frontend
app.use(addCorsHeaders);

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL encoded
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Eventos - Documentação'
}));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API de Eventos está funcionando!',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs'
    },
    endpoints: {
      usuarios: '/api/usuarios',
      auth: '/api/auth',
      presencas: '/api/presencas'
    }
  });
});

// Rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/presencas', presencasRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  // Garantir headers CORS mesmo em caso de erro
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  console.log(`📝 Endpoint de usuários: http://localhost:${PORT}/api/usuarios`);
  console.log(`🔐 Endpoint de autenticação: http://localhost:${PORT}/api/auth`);
  console.log(`✅ Endpoint de presenças: http://localhost:${PORT}/api/presencas`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});

