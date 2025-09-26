import { NextRequest, NextResponse } from 'next/server';
import { exportRevitalizacoesConsolidadoPdf } from '@/lib/pdf/relatorios-modern';
import { generateRevitalizacoesConsolidadoFileName } from '@/lib/filename-generator';
import type { RevitalizacaoRelatorio } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando geração de evidências de revitalizações...');
    const body = await request.json();
    const { mesAno, revitalizacoes } = body;

    console.log('📊 Dados recebidos:', { mesAno, revitalizacoesCount: revitalizacoes?.length });

    if (!mesAno || !revitalizacoes || revitalizacoes.length === 0) {
      console.log('❌ Dados inválidos recebidos');
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Gerar PDF usando a função de evidências de revitalizações
    console.log('🚀 Iniciando geração de PDF...');
    const pdfBuffer = await exportRevitalizacoesConsolidadoPdf(revitalizacoes, mesAno);
    
    console.log('✅ PDF gerado com sucesso!');
    
    // Gerar nome do arquivo baseado no mês/ano
    const fileName = generateRevitalizacoesConsolidadoFileName(mesAno);
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}.pdf`,
      },
    });

  } catch (error) {
    console.error('❌ Erro ao gerar evidências de revitalizações:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
