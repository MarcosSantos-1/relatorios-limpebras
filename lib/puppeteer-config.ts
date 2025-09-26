/**
 * Configuração centralizada do Puppeteer para Vercel
 * 
 * Esta função centraliza a configuração do Puppeteer para funcionar
 * corretamente em ambientes serverless como a Vercel.
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function getPuppeteerConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔧 Configurando Puppeteer:', { isProduction, nodeEnv: process.env.NODE_ENV });
  
  if (isProduction) {
    // Configuração para Vercel/Produção
    try {
      const executablePath = await chromium.executablePath();
      console.log('✅ Chromium path obtido:', executablePath);
      
      return {
        headless: true,
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        executablePath,
      };
    } catch (error) {
      console.error('❌ Erro ao obter chromium path:', error);
      // Fallback para desenvolvimento mesmo em produção
      return {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      };
    }
  } else {
    // Configuração para desenvolvimento local
    return {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    };
  }
}

/**
 * Função auxiliar para gerar PDF a partir de HTML
 * Configurada especificamente para Vercel
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const config = await getPuppeteerConfig();
  const browser = await puppeteer.launch(config);
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 }); // A4 landscape em pixels
    
    // Carregar HTML na página
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Aguardar um pouco mais para garantir que as imagens carreguem
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
