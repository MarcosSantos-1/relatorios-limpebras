const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { generatePDF } = require('../services/pdfGenerator');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Listar relatórios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tipo_servico, sub_regiao, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1'; // Removido filtro por usuário para compartilhar dados
    let params = [];
    let paramCount = 0;

    // Filtros opcionais
    if (tipo_servico) {
      paramCount++;
      whereClause += ` AND tipo_servico = $${paramCount}`;
      params.push(tipo_servico);
    }

    if (sub_regiao) {
      paramCount++;
      whereClause += ` AND sub_regiao = $${paramCount}`;
      params.push(sub_regiao);
    }

    if (data_inicio) {
      paramCount++;
      whereClause += ` AND data_relatorio >= $${paramCount}`;
      params.push(data_inicio);
    }

    if (data_fim) {
      paramCount++;
      whereClause += ` AND data_relatorio <= $${paramCount}`;
      params.push(data_fim);
    }

    // Buscar relatórios
    const result = await query(
      `SELECT r.*, 
              COUNT(e.id) as foto_count,
              COUNT(p.id) as pdf_count
       FROM relatorios r
       LEFT JOIN evidencias e ON r.id = e.relatorio_id
       LEFT JOIN pdfs_gerados p ON r.id = p.relatorio_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Contar total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM relatorios ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Formatar datas para retornar sem fuso horário
    const formattedRelatorios = result.rows.map(relatorio => ({
      ...relatorio,
      data_relatorio: relatorio.data_relatorio ? relatorio.data_relatorio.toISOString().split('T')[0] : null,
      created_at: relatorio.created_at ? relatorio.created_at.toISOString() : null,
      updated_at: relatorio.updated_at ? relatorio.updated_at.toISOString() : null
    }));

    res.json({
      relatorios: formattedRelatorios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter relatório específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar relatório
    const relatorioResult = await query(
      'SELECT * FROM relatorios WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (relatorioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    const relatorio = relatorioResult.rows[0];

    // Buscar evidências
    const evidenciasResult = await query(
      'SELECT * FROM evidencias WHERE relatorio_id = $1 ORDER BY ordem, created_at',
      [id]
    );

    // Buscar PDFs gerados
    const pdfsResult = await query(
      'SELECT * FROM pdfs_gerados WHERE relatorio_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Montar objeto completo
    const relatorioCompleto = {
      ...relatorio,
      evidencias: evidenciasResult.rows,
      pdfs_gerados: pdfsResult.rows
    };

    res.json(relatorioCompleto);
  } catch (error) {
    console.error('Erro ao obter relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar relatório
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      tipo_servico,
      titulo,
      data_relatorio,
      sub_regiao,
      local,
      descricao,
      dados_jsonb
    } = req.body;

    const userId = req.user.userId;

    // Validar dados obrigatórios
    if (!tipo_servico || !titulo || !data_relatorio) {
      return res.status(400).json({ error: 'Tipo de serviço, título e data são obrigatórios' });
    }

    // Criar relatório
    const result = await query(
      `INSERT INTO relatorios (user_id, tipo_servico, titulo, data_relatorio, sub_regiao, local, descricao, dados_jsonb)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, tipo_servico, titulo, data_relatorio, sub_regiao, local, descricao, dados_jsonb || {}]
    );

    res.status(201).json({
      message: 'Relatório criado com sucesso',
      relatorio: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar relatório
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      tipo_servico,
      titulo,
      data_relatorio,
      sub_regiao,
      local,
      descricao,
      dados_jsonb
    } = req.body;

    // Verificar se relatório existe e pertence ao usuário
    const existingResult = await query(
      'SELECT id FROM relatorios WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Atualizar relatório
    const result = await query(
      `UPDATE relatorios 
       SET tipo_servico = COALESCE($1, tipo_servico),
           titulo = COALESCE($2, titulo),
           data_relatorio = COALESCE($3, data_relatorio),
           sub_regiao = COALESCE($4, sub_regiao),
           local = COALESCE($5, local),
           descricao = COALESCE($6, descricao),
           dados_jsonb = COALESCE($7, dados_jsonb),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [tipo_servico, titulo, data_relatorio, sub_regiao, local, descricao, dados_jsonb, id, userId]
    );

    res.json({
      message: 'Relatório atualizado com sucesso',
      relatorio: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar relatório
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Verificar se relatório existe
    let existingResult;
    if (userRole === 'admin') {
      // Admin pode deletar qualquer relatório
      existingResult = await query(
        'SELECT id FROM relatorios WHERE id = $1',
        [id]
      );
    } else {
      // Usuário comum só pode deletar seus próprios relatórios
      existingResult = await query(
        'SELECT id FROM relatorios WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
    }

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Deletar evidências (arquivos serão removidos pelo sistema de limpeza)
    await query('DELETE FROM evidencias WHERE relatorio_id = $1', [id]);

    // Deletar PDFs gerados (arquivos serão removidos pelo sistema de limpeza)
    await query('DELETE FROM pdfs_gerados WHERE relatorio_id = $1', [id]);

    // Deletar relatório
    await query('DELETE FROM relatorios WHERE id = $1', [id]);

    res.json({ message: 'Relatório deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar PDF do relatório
router.post('/:id/generate-pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar relatório completo
    const relatorioResult = await query(
      'SELECT * FROM relatorios WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (relatorioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    const relatorio = relatorioResult.rows[0];

    // Buscar evidências
    const evidenciasResult = await query(
      'SELECT * FROM evidencias WHERE relatorio_id = $1 ORDER BY ordem, created_at',
      [id]
    );

    // Montar objeto para geração de PDF
    const relatorioParaPDF = {
      ...relatorio,
      fotos: evidenciasResult.rows.map(evidencia => ({
        url: evidencia.file_path,
        descricao: evidencia.descricao,
        etapa: evidencia.etapa,
        ordem: evidencia.ordem
      }))
    };

    // Gerar PDF
    const pdfBuffer = await generatePDF(relatorioParaPDF);

    // Salvar PDF no banco
    const filename = `relatorio_${id}_${Date.now()}.pdf`;
    const filePath = path.join(process.env.PDF_OUTPUT_DIR || './generated-pdfs', filename);

    // Criar diretório se não existir
    const pdfDir = path.dirname(filePath);
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Salvar arquivo
    fs.writeFileSync(filePath, pdfBuffer);

    // Salvar registro no banco
    const pdfResult = await query(
      'INSERT INTO pdfs_gerados (relatorio_id, filename, file_path, file_size, tipo_geracao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, filename, filePath, pdfBuffer.length, 'individual']
    );

    // Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao gerar PDF' });
  }
});

// Download PDF existente
router.get('/:id/pdf/:pdfId', authenticateToken, async (req, res) => {
  try {
    const { id, pdfId } = req.params;
    const userId = req.user.userId;

    // Verificar se relatório pertence ao usuário
    const relatorioResult = await query(
      'SELECT id FROM relatorios WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (relatorioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Buscar PDF
    const pdfResult = await query(
      'SELECT * FROM pdfs_gerados WHERE id = $1 AND relatorio_id = $2',
      [pdfId, id]
    );

    if (pdfResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDF não encontrado' });
    }

    const pdf = pdfResult.rows[0];

    // Verificar se arquivo existe
    if (!fs.existsSync(pdf.file_path)) {
      return res.status(404).json({ error: 'Arquivo PDF não encontrado no servidor' });
    }

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.filename}"`);
    res.sendFile(path.resolve(pdf.file_path));

  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
