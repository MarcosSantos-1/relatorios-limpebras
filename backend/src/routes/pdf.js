const express = require('express');
const { generatePDF } = require('../services/pdfGenerator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Gerar PDF de relatório específico
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { relatorio_id, tipo_geracao = 'individual' } = req.body;
    const userId = req.user.userId;

    if (!relatorio_id) {
      return res.status(400).json({ error: 'ID do relatório é obrigatório' });
    }

    // Buscar relatório completo
    const relatorioResult = await query(
      'SELECT * FROM relatorios WHERE id = $1 AND user_id = $2',
      [relatorio_id, userId]
    );

    if (relatorioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    const relatorio = relatorioResult.rows[0];

    // Buscar evidências
    const evidenciasResult = await query(
      'SELECT * FROM evidencias WHERE relatorio_id = $1 ORDER BY ordem, created_at',
      [relatorio_id]
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
    const filename = `relatorio_${relatorio_id}_${Date.now()}.pdf`;
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
      [relatorio_id, filename, filePath, pdfBuffer.length, tipo_geracao]
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

// Gerar PDF consolidado (múltiplos relatórios)
router.post('/generate-consolidated', authenticateToken, async (req, res) => {
  try {
    const { relatorio_ids, titulo_consolidado } = req.body;
    const userId = req.user.userId;

    if (!relatorio_ids || !Array.isArray(relatorio_ids) || relatorio_ids.length === 0) {
      return res.status(400).json({ error: 'IDs dos relatórios são obrigatórios' });
    }

    // Buscar todos os relatórios
    const relatorios = [];
    for (const relatorioId of relatorio_ids) {
      const relatorioResult = await query(
        'SELECT * FROM relatorios WHERE id = $1 AND user_id = $2',
        [relatorioId, userId]
      );

      if (relatorioResult.rows.length === 0) {
        return res.status(404).json({ error: `Relatório ${relatorioId} não encontrado` });
      }

      const relatorio = relatorioResult.rows[0];

      // Buscar evidências
      const evidenciasResult = await query(
        'SELECT * FROM evidencias WHERE relatorio_id = $1 ORDER BY ordem, created_at',
        [relatorioId]
      );

      relatorios.push({
        ...relatorio,
        fotos: evidenciasResult.rows.map(evidencia => ({
          url: evidencia.file_path,
          descricao: evidencia.descricao,
          etapa: evidencia.etapa,
          ordem: evidencia.ordem
        }))
      });
    }

    // Gerar PDF consolidado (implementar lógica específica conforme necessário)
    const pdfBuffer = await generatePDF(relatorios[0]); // Por enquanto, usar o primeiro relatório

    // Salvar PDF no banco
    const filename = `relatorio_consolidado_${Date.now()}.pdf`;
    const filePath = path.join(process.env.PDF_OUTPUT_DIR || './generated-pdfs', filename);

    // Criar diretório se não existir
    const pdfDir = path.dirname(filePath);
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Salvar arquivo
    fs.writeFileSync(filePath, pdfBuffer);

    // Salvar registro no banco para cada relatório
    for (const relatorio of relatorios) {
      await query(
        'INSERT INTO pdfs_gerados (relatorio_id, filename, file_path, file_size, tipo_geracao) VALUES ($1, $2, $3, $4, $5)',
        [relatorio.id, filename, filePath, pdfBuffer.length, 'consolidado']
      );
    }

    // Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar PDF consolidado:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao gerar PDF consolidado' });
  }
});

// Listar PDFs gerados
router.get('/list/:relatorio_id', authenticateToken, async (req, res) => {
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

    // Buscar PDFs gerados
    const result = await query(
      'SELECT * FROM pdfs_gerados WHERE relatorio_id = $1 ORDER BY created_at DESC',
      [relatorio_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar PDFs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Download PDF específico
router.get('/download/:pdf_id', authenticateToken, async (req, res) => {
  try {
    const { pdf_id } = req.params;
    const userId = req.user.userId;

    // Buscar PDF com verificação de propriedade
    const result = await query(
      `SELECT p.* FROM pdfs_gerados p
       JOIN relatorios r ON p.relatorio_id = r.id
       WHERE p.id = $1 AND r.user_id = $2`,
      [pdf_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF não encontrado' });
    }

    const pdf = result.rows[0];

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

// Deletar PDF
router.delete('/:pdf_id', authenticateToken, async (req, res) => {
  try {
    const { pdf_id } = req.params;
    const userId = req.user.userId;

    // Buscar PDF com verificação de propriedade
    const result = await query(
      `SELECT p.* FROM pdfs_gerados p
       JOIN relatorios r ON p.relatorio_id = r.id
       WHERE p.id = $1 AND r.user_id = $2`,
      [pdf_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF não encontrado' });
    }

    const pdf = result.rows[0];

    // Deletar arquivo físico
    if (fs.existsSync(pdf.file_path)) {
      fs.unlinkSync(pdf.file_path);
    }

    // Deletar do banco
    await query('DELETE FROM pdfs_gerados WHERE id = $1', [pdf_id]);

    res.json({ message: 'PDF deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar PDF:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Limpeza de PDFs antigos (endpoint administrativo)
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Verificar se usuário é admin
    const userResult = await query(
      'SELECT role FROM usuarios WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { days_old = 30 } = req.body;

    // Buscar PDFs antigos
    const result = await query(
      'SELECT * FROM pdfs_gerados WHERE created_at < NOW() - INTERVAL \'$1 days\'',
      [days_old]
    );

    let deletedCount = 0;
    let errorCount = 0;

    for (const pdf of result.rows) {
      try {
        // Deletar arquivo físico
        if (fs.existsSync(pdf.file_path)) {
          fs.unlinkSync(pdf.file_path);
        }

        // Deletar do banco
        await query('DELETE FROM pdfs_gerados WHERE id = $1', [pdf.id]);
        deletedCount++;
      } catch (error) {
        console.error(`Erro ao deletar PDF ${pdf.id}:`, error);
        errorCount++;
      }
    }

    res.json({
      message: 'Limpeza concluída',
      deleted: deletedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Erro na limpeza:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
