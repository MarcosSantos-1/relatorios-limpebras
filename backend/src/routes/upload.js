const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configuração do multer para upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});

// Upload de arquivo único
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const userId = req.user.userId;
    const { relatorio_id, descricao, etapa, ordem } = req.body;

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, filename);

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Processar imagem com Sharp (otimização)
    let processedBuffer = req.file.buffer;
    
    if (req.file.mimetype.startsWith('image/')) {
      try {
        processedBuffer = await sharp(req.file.buffer)
          .resize(1920, 1080, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch (sharpError) {
        console.warn('Erro ao processar imagem com Sharp:', sharpError);
        // Continuar com o buffer original se Sharp falhar
      }
    }

    // Salvar arquivo
    fs.writeFileSync(filePath, processedBuffer);

    // Salvar no banco de dados
    const result = await query(
      `INSERT INTO evidencias (relatorio_id, filename, original_name, file_path, file_size, mime_type, etapa, descricao, ordem)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        relatorio_id,
        filename,
        req.file.originalname,
        filePath,
        processedBuffer.length,
        req.file.mimetype,
        etapa,
        descricao,
        parseInt(ordem) || 0
      ]
    );

    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      evidencia: result.rows[0]
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload múltiplo
router.post('/multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const userId = req.user.userId;
    const { relatorio_id } = req.body;
    const evidencias = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, filename);

      // Criar diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Processar imagem com Sharp
      let processedBuffer = file.buffer;
      
      if (file.mimetype.startsWith('image/')) {
        try {
          processedBuffer = await sharp(file.buffer)
            .resize(1920, 1080, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();
        } catch (sharpError) {
          console.warn('Erro ao processar imagem com Sharp:', sharpError);
        }
      }

      // Salvar arquivo
      fs.writeFileSync(filePath, processedBuffer);

      // Salvar no banco de dados
      const result = await query(
        `INSERT INTO evidencias (relatorio_id, filename, original_name, file_path, file_size, mime_type, ordem)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          relatorio_id,
          filename,
          file.originalname,
          filePath,
          processedBuffer.length,
          file.mimetype,
          i
        ]
      );

      evidencias.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${evidencias.length} arquivo(s) enviado(s) com sucesso`,
      evidencias
    });

  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar evidências de um relatório
router.get('/relatorio/:relatorio_id', authenticateToken, async (req, res) => {
  try {
    const { relatorio_id } = req.params;
    const userId = req.user.userId;

    // Verificar se relatório pertence ao usuário
    const relatorioResult = await query(
      'SELECT id FROM relatorios WHERE id = $1 AND user_id = $2',
      [relatorio_id, userId]
    );

    if (relatorioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Buscar evidências
    const result = await query(
      'SELECT * FROM evidencias WHERE relatorio_id = $1 ORDER BY ordem, created_at',
      [relatorio_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar evidências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter evidência específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar evidência com verificação de propriedade
    const result = await query(
      `SELECT e.* FROM evidencias e
       JOIN relatorios r ON e.relatorio_id = r.id
       WHERE e.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter evidência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar evidência
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { descricao, etapa, ordem } = req.body;

    // Verificar se evidência pertence ao usuário
    const existingResult = await query(
      `SELECT e.id FROM evidencias e
       JOIN relatorios r ON e.relatorio_id = r.id
       WHERE e.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    // Atualizar evidência
    const result = await query(
      `UPDATE evidencias 
       SET descricao = COALESCE($1, descricao),
           etapa = COALESCE($2, etapa),
           ordem = COALESCE($3, ordem)
       WHERE id = $4
       RETURNING *`,
      [descricao, etapa, ordem, id]
    );

    res.json({
      message: 'Evidência atualizada com sucesso',
      evidencia: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar evidência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar evidência
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar evidência com verificação de propriedade
    const existingResult = await query(
      `SELECT e.* FROM evidencias e
       JOIN relatorios r ON e.relatorio_id = r.id
       WHERE e.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    const evidencia = existingResult.rows[0];

    // Deletar arquivo físico
    if (fs.existsSync(evidencia.file_path)) {
      fs.unlinkSync(evidencia.file_path);
    }

    // Deletar do banco
    await query('DELETE FROM evidencias WHERE id = $1', [id]);

    res.json({ message: 'Evidência deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evidência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Download de arquivo
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar evidência com verificação de propriedade
    const result = await query(
      `SELECT e.* FROM evidencias e
       JOIN relatorios r ON e.relatorio_id = r.id
       WHERE e.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    const evidencia = result.rows[0];

    // Verificar se arquivo existe
    if (!fs.existsSync(evidencia.file_path)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    // Enviar arquivo
    res.setHeader('Content-Type', evidencia.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${evidencia.original_name}"`);
    res.sendFile(path.resolve(evidencia.file_path));

  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Visualizar imagem
router.get('/:id/view', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar evidência com verificação de propriedade
    const result = await query(
      `SELECT e.* FROM evidencias e
       JOIN relatorios r ON e.relatorio_id = r.id
       WHERE e.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    const evidencia = result.rows[0];

    // Verificar se é uma imagem
    if (!evidencia.mime_type.startsWith('image/')) {
      return res.status(400).json({ error: 'Arquivo não é uma imagem' });
    }

    // Verificar se arquivo existe
    if (!fs.existsSync(evidencia.file_path)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    // Enviar imagem
    res.setHeader('Content-Type', evidencia.mime_type);
    res.sendFile(path.resolve(evidencia.file_path));

  } catch (error) {
    console.error('Erro ao visualizar imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
