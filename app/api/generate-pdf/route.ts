/**
 * API para Geração de PDFs - Endpoint Unificado
 * 
 * Este arquivo centraliza toda a geração de PDFs da aplicação.
 * Suporta diferentes tipos de relatórios com templates específicos.
 * 
 * Tipos suportados:
 * - mutirao: Relatórios de mutirão (individual ou consolidado)
 * - registro: Registros fotográficos (acumulador, desfazimento, etc.)
 * - evidencias: Evidências fotográficas
 * - unified: Relatórios unificados (revitalização, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';

// Importações dos geradores de PDF específicos
import { exportMutiraoPdf, exportRegistroPdf } from '@/lib/pdf/mutirao-modern';
import { exportEvidenciasPdf } from '@/lib/pdf/evidencias-modern';
import { exportUnifiedPdf } from '@/lib/pdf/relatorios-modern';
import { generateMonumentosHTML } from '@/lib/pdf/monumentos-modern';

// Importações para geração de nomes de arquivos
import { generateFileName, generateConsolidatedFileName } from '@/lib/filename-generator';

// Configuração centralizada do Puppeteer
import { generatePDFFromHTML } from '@/lib/puppeteer-config';

// Tipos TypeScript
import type { MutiraoRelatorio, RegistroRelatorio, ReportSummary, Relatorio, MonumentosRelatorio } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, dados, consolidated } = body;

    console.log('📊 PDF Request:', { tipo, dados: dados?.tipoServico, consolidated });

    // Validação básica
    if (!tipo || !dados) {
      console.error('❌ Validação falhou:', { tipo, dados: !!dados });
      return NextResponse.json({ error: 'Tipo e dados são obrigatórios' }, { status: 400 });
    }

    let pdfBuffer: Buffer | Uint8Array;
    let fileName: string;

    // ========================================
    // ROTEAMENTO POR TIPO DE RELATÓRIO
    // ========================================

    switch (tipo) {
      case 'mutirao':
        console.log('🔄 Processando mutirão...');
        // Relatório de mutirão (SELIMP)
        pdfBuffer = await exportMutiraoPdf(dados as MutiraoRelatorio);
        fileName = consolidated 
          ? generateConsolidatedFileName(dados.data) // Data filtrada para consolidado
          : generateFileName(dados as MutiraoRelatorio);
        break;

      case 'registro':
        console.log('🔄 Processando registro...');
        // Registros fotográficos (Acumulador, Desfazimento, etc.)
        pdfBuffer = await exportRegistroPdf(dados as RegistroRelatorio);
        fileName = generateFileName(dados as RegistroRelatorio);
        break;

      case 'evidencias':
        console.log('🔄 Processando evidências...', dados.tipoServico);
        // Evidências fotográficas gerais
        pdfBuffer = await exportEvidenciasPdf(dados as Relatorio);
        fileName = generateFileName(dados as Relatorio);
        break;

      case 'unified':
        console.log('🔄 Processando unificado...');
        // Relatórios unificados (Revitalização, etc.)
        pdfBuffer = await exportUnifiedPdf(dados as Relatorio);
        fileName = generateFileName(dados as Relatorio);
        break;

      case 'monumentos':
        console.log('🔄 Processando monumentos...');
        // Relatórios de Monumentos
        const html = generateMonumentosHTML(dados as MonumentosRelatorio);
        pdfBuffer = await generatePDFFromHTML(html);
        fileName = generateFileName(dados as MonumentosRelatorio);
        break;

      default:
        console.error('❌ Tipo inválido:', tipo);
        return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 });
    }

    // ========================================
    // RESPOSTA COM PDF GERADO
    // ========================================

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // Usa UTF-8 encoding para suportar caracteres especiais nos nomes
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}.pdf`,
      },
    });

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Erro interno do servidor ao gerar PDF', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
