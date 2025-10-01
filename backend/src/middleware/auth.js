const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se usuário ainda existe e está ativo
    const userResult = await query(
      'SELECT id, email, role, ativo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].ativo) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar role de admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado - requer permissão de administrador' });
  }
  next();
};

// Middleware para verificar ownership de recurso
const requireOwnership = (resourceTable, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.userId;

      const result = await query(
        `SELECT id FROM ${resourceTable} WHERE id = $1 AND user_id = $2`,
        [resourceId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recurso não encontrado ou sem permissão' });
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de ownership:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership
};
