import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando geração de PDF com Puppeteer...');
    
    // Importar puppeteer completo diretamente
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer');
    
    console.log('🚀 Iniciando browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser iniciado com sucesso!');
    
    try {
      const page = await browser.newPage();
      console.log('📄 Nova página criada');
      
      // HTML simples para teste
      const testHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste PDF</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            text-align: center;
            background: white;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <h1>Teste de Geração de PDF</h1>
    <p>Este é um teste para verificar se a geração de PDF está funcionando corretamente.</p>
    <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
</body>
</html>
      `;

      console.log('📝 Carregando HTML na página...');
      await page.setContent(testHTML, { waitUntil: 'networkidle0' });
      
      console.log('🔄 Gerando PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      
      console.log('✅ PDF gerado com sucesso! Tamanho:', pdfBuffer.length, 'bytes');
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="teste-pdf.pdf"',
        },
      });
      
    } finally {
      console.log('🔒 Fechando browser...');
      await browser.close();
    }

  } catch (error) {
    console.error('❌ Erro ao gerar PDF de teste:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
