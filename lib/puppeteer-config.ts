/**
 * Configuração centralizada do Puppeteer para Vercel
 * 
 * Esta função centraliza a configuração do Puppeteer para funcionar
 * corretamente em ambientes serverless como a Vercel.
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Importar puppeteer completo para desenvolvimento
let puppeteerDev: any = null;
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    puppeteerDev = require('puppeteer');
  } catch (error) {
    console.log('Puppeteer completo não disponível, usando puppeteer-core');
  }
}

export async function getPuppeteerConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Configuração para Vercel/Produção - usar chromium-min
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
      executablePath: await chromium.executablePath(),
    };
  } else {
    // Configuração para desenvolvimento local
    if (puppeteerDev) {
      // Usar puppeteer completo se disponível
      return {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 600000 // 10 minutos de timeout para relatórios grandes
      };
    } else {
      // Fallback para puppeteer-core com executablePath
      return {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Caminho padrão do Chrome no macOS
        timeout: 600000
      };
    }
  }
}

/**
 * Função auxiliar para gerar PDF a partir de HTML
 * Configurada especificamente para Vercel
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  // Usar puppeteer completo diretamente em desenvolvimento
  const puppeteerInstance = (process.env.NODE_ENV !== 'production' && puppeteerDev) ? puppeteerDev : puppeteer;
  
  const browser = await puppeteerInstance.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 }); // A4 landscape em pixels
    
    // Carregar HTML na página
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 300000 // 5 minutos para carregar HTML com muitas imagens
    });
    
    // Aguardar um pouco mais para garantir que as imagens carreguem
    await new Promise(resolve => setTimeout(resolve, 10000)); // Aumentado para 10 segundos
    
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
