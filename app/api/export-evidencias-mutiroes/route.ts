import { NextRequest, NextResponse } from 'next/server';
import { exportEvidenciasMutiroesPdf } from '@/lib/pdf/mutirao-modern';
import { generateConsolidatedFileName } from '@/lib/filename-generator';
import type { MutiraoRelatorio } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando geração de evidências de mutirões...');
    const body = await request.json();
    const { data, mutiroes } = body;

    console.log('📊 Dados recebidos:', { data, mutiroesCount: mutiroes?.length });

    if (!data || !mutiroes || mutiroes.length === 0) {
      console.log('❌ Dados inválidos recebidos');
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Gerar PDF usando a nova função de evidências de mutirões
    console.log('🚀 Iniciando geração de PDF...');
    const pdfBuffer = await exportEvidenciasMutiroesPdf(mutiroes, data);
    
    console.log('✅ PDF gerado com sucesso!');
    
    const fileName = generateConsolidatedFileName(data);
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}.pdf`,
      },
    });

  } catch (error) {
    console.error('❌ Erro ao gerar evidências de mutirões:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
