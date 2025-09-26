/**
 * API de teste específica para evidências
 */
import { NextRequest, NextResponse } from 'next/server';
import { exportEvidenciasPdf } from '@/lib/pdf/evidencias-modern';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testando exportEvidenciasPdf...');
    
    // Dados de teste baseados no relatório que está falhando
    const testData = {
      id: "test-id",
      tipoServico: "ZELADORIA",
      sub: "JT",
      dataInicio: "2025-09-25",
      dataTermino: "2025-09-25",
      fotos: [
        {
          url: "https://via.placeholder.com/800x600/cccccc/000000?text=Teste+Imagem",
          descricao: "Foto de teste"
        }
      ],
      descricao: "Teste de descrição",
      local: "Local de teste",
      title: "Zeladoria - JAÇANÃ / TREMEMBÉ - 25/09/2025",
      assunto: "Zeladoria",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    console.log('📊 Dados de teste:', testData);
    
    const pdfBuffer = await exportEvidenciasPdf(testData);
    console.log('✅ PDF de evidências gerado com sucesso');
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=teste-evidencias.pdf',
      },
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de evidências:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Erro no teste de evidências', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
