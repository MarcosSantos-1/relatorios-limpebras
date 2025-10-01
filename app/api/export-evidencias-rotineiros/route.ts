import { NextRequest, NextResponse } from 'next/server';
import { exportEvidenciasRotineirosPdf } from '@/lib/pdf/rotineiros-modern';
import { generateRotineirosConsolidadoFileName } from '@/lib/filename-generator';

export async function POST(request: NextRequest) {
  try {
    const { mesAno, rotineiros } = await request.json();

    if (!rotineiros || rotineiros.length === 0) {
      return NextResponse.json({ error: 'Nenhum serviço rotineiro fornecido' }, { status: 400 });
    }

    console.log(`📊 Gerando PDF de evidências para ${rotineiros.length} serviço(s) rotineiro(s) do mês ${mesAno}`);

    const pdfBuffer = await exportEvidenciasRotineirosPdf(mesAno, rotineiros);

    const fileName = generateRotineirosConsolidadoFileName(mesAno);
    
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF de evidências de serviços rotineiros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao gerar PDF' },
      { status: 500 }
    );
  }
}
