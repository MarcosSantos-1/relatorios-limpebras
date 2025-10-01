// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'Arquivo muito grande',
      details: `Tamanho máximo permitido: ${process.env.MAX_FILE_SIZE || '10MB'}`
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: 'Muitos arquivos',
      details: 'Número máximo de arquivos excedido'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Campo de arquivo inesperado',
      details: 'Verifique o nome do campo do arquivo'
    });
  }

  // Erro de tipo de arquivo não permitido
  if (err.message && err.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({ 
      error: 'Tipo de arquivo não permitido',
      details: `Tipos permitidos: ${process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp'}`
    });
  }

  // Erro de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details.map(detail => detail.message)
    });
  }

  // Erro de banco de dados
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({ 
          error: 'Conflito de dados',
          details: 'Registro já existe'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({ 
          error: 'Referência inválida',
          details: 'Registro referenciado não existe'
        });
      case '23502': // Not null violation
        return res.status(400).json({ 
          error: 'Campo obrigatório',
          details: 'Alguns campos obrigatórios não foram preenchidos'
        });
      case '42P01': // Undefined table
        return res.status(500).json({ 
          error: 'Erro de configuração',
          details: 'Tabela não encontrada'
        });
      default:
        return res.status(500).json({ 
          error: 'Erro de banco de dados',
          details: 'Erro interno do servidor'
        });
    }
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'JSON inválido',
      details: 'Formato de dados inválido'
    });
  }

  // Erro padrão
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
};

// Middleware para log de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      console.error('❌ Request Error:', logData);
    } else {
      console.log('✅ Request:', logData);
    }
  });

  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger
};
