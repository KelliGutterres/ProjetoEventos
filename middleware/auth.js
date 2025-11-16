/**
 * Middleware de autenticação
 * Valida se o token "12345" está presente no header Authorization
 */

const TOKEN_FIXO = '12345';

const authenticate = (req, res, next) => {
  // Obter o token do header Authorization
  const authHeader = req.headers.authorization;

  // Verificar se o header Authorization existe
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido. Adicione o header Authorization com o token.',
      authorized: false
    });
  }

  // Extrair o token (pode estar no formato "Bearer 12345" ou apenas "12345")
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  // Validar o token
  if (token !== TOKEN_FIXO) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação inválido',
      authorized: false
    });
  }

  // Token válido, continuar com a requisição
  next();
};

module.exports = authenticate;

