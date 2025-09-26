/**
 * Configuração centralizada do Puppeteer para Vercel
 * Baseada no guia oficial: https://vercel.com/guides/deploying-puppeteer-with-nextjs-on-vercel
 */

export async function getPuppeteerConfig() {
  const isVercel = !!process.env.VERCEL_ENV;
  
  console.log('🔧 Configurando Puppeteer:', { isVercel, vercelEnv: process.env.VERCEL_ENV });
  
  let puppeteer: any;
  let launchOptions: any = {
    headless: true,
  };

  if (isVercel) {
    // Configuração para Vercel/Produção
    const chromium = (await import("@sparticuz/chromium-min")).default;
    puppeteer = await import("puppeteer-core");
    
    launchOptions = {
      ...launchOptions,
      args: chromium.args,
      executablePath: await chromium.executablePath(),
    };
    
    console.log('✅ Configuração Vercel aplicada');
  } else {
    // Configuração para desenvolvimento local
    puppeteer = await import("puppeteer");
    console.log('✅ Configuração local aplicada');
  }

  return { puppeteer, launchOptions };
}

/**
 * Função auxiliar para gerar PDF a partir de HTML
 * Configurada especificamente para Vercel
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const { puppeteer, launchOptions } = await getPuppeteerConfig();
  const browser = await puppeteer.launch(launchOptions);
  
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
