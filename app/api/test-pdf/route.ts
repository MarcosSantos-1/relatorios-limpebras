/**
 * API de teste para debug do Puppeteer
 */
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testando Puppeteer...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser lançado com sucesso');
    
    const page = await browser.newPage();
    console.log('✅ Página criada');
    
    await page.setContent('<html><body><h1>Teste PDF</h1></body></html>');
    console.log('✅ Conteúdo definido');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true
    });
    console.log('✅ PDF gerado');
    
    await browser.close();
    console.log('✅ Browser fechado');
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=teste.pdf',
      },
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json(
      { error: 'Erro no teste', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
