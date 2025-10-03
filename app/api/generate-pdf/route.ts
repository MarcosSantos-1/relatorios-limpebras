/**
 * API para Geração de PDFs - Proxy para Backend
 * 
 * Este arquivo redireciona a geração de PDFs para o backend.
 * O backend é responsável por toda a lógica de geração de PDFs.
 */

import { NextRequest, NextResponse } from 'next/server';

// Importações para geração de nomes de arquivos
import { generateFileName } from '@/lib/filename-generator';

// Tipos TypeScript
import type { Relatorio } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, dados } = body;

    console.log('📊 PDF Request:', { tipo, dados: dados?.tipoServico });

    // Validação básica
    if (!tipo || !dados) {
      console.error('❌ Validação falhou:', { tipo, dados: !!dados });
      return NextResponse.json({ error: 'Tipo e dados são obrigatórios' }, { status: 400 });
    }

    // Para evidências, gerar PDF diretamente no backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    let response;
    if (tipo === 'evidencias') {
      // Gerar PDF de evidências diretamente
      response = await fetch(`${backendUrl}/api/pdf/generate-evidencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${body.token || ''}`
        },
        body: JSON.stringify(dados)
      });
    } else {
      // Para relatórios individuais, usar rota existente
      response = await fetch(`${backendUrl}/api/relatorios/${dados.id}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${body.token || ''}`
        }
      });
    }

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    const fileName = generateFileName(dados);

    console.log('✅ PDF gerado com sucesso via backend');

    // Retornar o PDF gerado pelo backend
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
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
