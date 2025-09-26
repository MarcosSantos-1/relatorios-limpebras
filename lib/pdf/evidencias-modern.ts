import puppeteer from 'puppeteer';
import { getPuppeteerConfig } from '@/lib/puppeteer-config';
import type { Relatorio, RegistroRelatorio, RevitalizacaoRelatorio } from '@/lib/types';
import { SUB_REGIOES, TIPOS_SERVICO, TITULOS_RELATORIOS } from '@/lib/types';
import { getImageUrls } from './image-loader';
import { formatPeriodForServicePage } from '@/lib/utils';

// Função para formatar data para a capa
function formatDateForCover(date: string | Date): string {
  const d = new Date(date);
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d.getFullYear();
  return `São Paulo, ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
}

// Função para gerar HTML do relatório de evidências
function generateEvidenciasHTML(rel: Relatorio): string {
  const images = getImageUrls();
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Evidências</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');
        
        /* ========================================
         * CONFIGURAÇÕES DE PÁGINA E AJUSTES
         * ========================================
         * 
         * ALTURA DAS CAPAS:
         * - Todas as capas: 100vh (altura total da viewport)
         * - Evita quebras de página desnecessárias
         * 
         * QUEBRAS DE PÁGINA:
         * - Última página: page-break-after: avoid (evita página em branco)
         * - Demais páginas: page-break-after: always
         */
        
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
            background: white;
        }
        
        .page {
            width: 100%;
            min-height: calc(100vh - 0px);
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
            overflow: hidden;
            padding: 30px 60px 30px 30px; /* Substitui margin por padding */
            /* As margens são controladas pelo padding agora */
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .page:not(:last-child) {
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100vh; /* Altura total da viewport - AJUSTE PARA EVITAR QUEBRA DE PÁGINA */
            overflow: hidden;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
            /* Removido o padding da capa */
        }
        
        .cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${images.cover}') center/cover no-repeat;
            z-index: 1;
        }
        
        .cover-logo {
            position: absolute;
            top: -90px;
            right: 80px;
            width: 330px;
            height: 330px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 3;
        }
        
        .cover-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: right;
            text-align: right;
        }
        
        .cover-title {
            font-family: 'Anton', sans-serif;
            font-size: 80px;
            font-weight: 600;
            color: rgb(0, 48, 107);
            line-height: 1.25;
            text-transform: uppercase;
            max-width: 440px;
            overflow-wrap: break-word;
            text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
            letter-spacing: 0.25px;
            position: absolute;
            top: 270px;
            right: 10px;
            text-align: center;
            margin: 0;
        }
        .cover-title .break {
            display: block;
            margin-top: 0px;
        }
        
        .cover-date {
            font-size: 26px;
            color: rgb(0, 48, 107);
            font-weight: bold;
            position: absolute;
            right: 50px;
            top: 520px;
            margin-top: 0;
            margin-right: 0;
            text-align: right;
            width: auto;
        }
        
        /* PÁGINA DE SERVIÇO */
        .service-page {
            page-break-before: always;
            position: relative;
            width: 100%;
            min-height: calc(210mm - 0px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
            padding: 30px 60px 30px 30px; /* Garante padding */
        }
        
        .service-logo {
            position: absolute;
            top: -70px;
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            height: 280px;
            background: url('${images.logo}') center/contain no-repeat;
        }
        
        .service-title {
            font-family: 'Anton', sans-serif;
            font-size: 76px;
            font-weight: 600;
            color: rgb(0, 48, 107);
            margin-bottom: 100px;
            text-transform: uppercase;
            margin-top: 100px;
            max-width: 19.5cm;
            line-height: 1.2;
            letter-spacing: 1px;
        }
        
        .service-period {
            font-size: 26px;
            color: rgb(0, 48, 107);
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .service-subregion {
            font-size: 24px;
            color: rgb(0, 48, 107);
            margin-bottom: 50px;
        }
        
        .service-footer-line {
            position: absolute;
            bottom: -53px;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* PÁGINA DE RESUMO */
        .summary-page {
            page-break-before: always;
            min-height: calc(210mm - 0px);
            padding: 20px 60px 20px 30px;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .summary-header {
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: 0 0 20px 0;
        }
        
        .summary-header h2 {
            font-size: 20px;
            font-weight: bold;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
        }
        
        .summary-table th,
        .summary-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        .summary-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .summary-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* PÁGINA DE SUB-REGIÃO */
        .subregion-page {
            page-break-before: always;
            min-height: calc(210mm - 0px);
            padding: 20px 60px 20px 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .subregion-header {
            background: #3498db;
            color: white;
            padding: 15px 20px;
            margin: 0 0 20px 0;
            width: 100%;
        }
        
        .subregion-header h2 {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
        
        .subregion-content {
            font-size: 24px;
            color: #2c3e50;
            font-weight: bold;
            margin: 50px 0;
        }
        
        .subregion-line {
            width: 100%;
            height: 2px;
            background: #2c3e50;
            margin: 20px 0;
        }
        
        /* PÁGINA DE CONTEÚDO */
        .content-page {
            min-height: calc(210mm - 0px);
            padding: 40px 60px 40px 30px;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        /* CABEÇALHO DA PÁGINA FOTOGRÁFICA */
        .photo-page-header {
            position: relative;
            background: #34495e;
            color: white;
            min-height: 80px;
            padding: 60px 0px 0px 0px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            page-break-after: avoid;
            break-after: avoid;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        
        .photo-logo {
            width: 40px;
            height: 80px;
            background: url('${images.logo}') center/contain no-repeat;
        }
        
        /* DESCRITORES */
        .photo-descriptors {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 12px;
            line-height: 1.4;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .descriptor-item {
            margin-bottom: 8px;
            color: #2c3e50;
        }
        
        .descriptor-item:last-child {
            margin-bottom: 0;
        }
        
        .descriptor-item strong {
            color: #34495e;
        }
        
        /* CABEÇALHO COM LOGOS PARA PÁGINAS FOTOGRÁFICAS */
        .photo-header{
            display: flex;
            position: relative;
            justify-content: space-between;
            align-items: space-between;
            width: 100%;
            height: 80px;
            z-index: 10;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .photo-header .prefeitura-logo {
            position: absolute;
            left: 20px;
            top: 30px;
            transform: translateY(-50%);
            width: 120px;
            height: 120px;
            background: url('${images.prefeitura}') center/contain no-repeat;
        }
        
        .photo-header .company-logo {
            position: absolute;
            right: 20px;
            top: 30px;
            transform: translateY(-50%);
            width: 120px;
            height: 100px;
            background: url('${images.logo}') center/contain no-repeat;
        }  
            
        
        /* GRID DE FOTOS DINÂMICO */
        .photos-grid {
            display: grid;
            gap: 20px;
            margin-top: 25px;
            justify-content: center;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .photos-grid.one-photo {
            grid-template-columns: repeat(3, 1fr);
            max-width: 100%;
            margin: 15px 0 0 0;
        }
        
        .photos-grid.two-photos {
            grid-template-columns: repeat(3, 1fr);
            max-width: 100%;
            margin: 15px 0 0 0;
        }
        
        .photos-grid.three-photos {
            grid-template-columns: repeat(3, 1fr);
            max-width: 100%;
            margin: 15px 0 0 0;
        }
        
        .photo-item {
            text-align: center;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .photo-container {
            width: 100%;
            border: none;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 10px;
            break-inside: avoid;
            page-break-inside: avoid;
            /* Ajuste para garantir que a altura máxima não ultrapasse a página */
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
        }
        
        /* ALTURA UNIFICADA PARA TODAS AS FOTOS - SEM QUEBRA DE PÁGINA */
        .photos-grid.one-photo .photo-container {
            height: 380px;
            max-height: 380px;
        }
        
        .photos-grid.two-photos .photo-container {
            height: 380px;
            max-height: 380px;
        }
        
        .photos-grid.three-photos .photo-container {
            height: 380px;
            max-height: 380px;
        }
        
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        
        .photo-description {
            font-size: 13px;
            color: #2c3e50;
            font-weight: bold;
        }
        
        .photos-grid.one-photo .photo-description {
            display: none;
        }
        
        /* PÁGINA FINAL */
        .final-page {
            page-break-before: always;
            position: relative;
            width: 100%;
            min-height: calc(210mm - 0px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
            /* Removido o padding da contracapa */
        }
        
        .final-logo {
            width: 18cm;
            height: 18cm;
            background: url('${images.logo}') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') repeat-x;
            background-size: contain;
            transform: scaleY(-1);
            z-index: 10;
        }
        
        .final-bottom-line {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') repeat-x;
            background-size: contain;
            z-index: 10;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
                break-inside: avoid;
                page-break-inside: avoid;
                /* padding já está aplicado */
            }
            
            /* Configurações específicas para quebra de página */
            .page.cover-page,
            .page.service-page,
            .page.content-page {
                page-break-after: always;
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            /* Evitar quebras dentro de elementos importantes */
            .photo-header-with-logos,
            .photo-descriptors {
                page-break-after: avoid;
                break-after: avoid;
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
        }
    </style>
</head>
<body>
    <!-- CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE EVIDÊNCIAS</h1>
            <div class="cover-date">${formatDateForCover('data' in rel ? rel.data : rel.dataInicio)}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">${TITULOS_RELATORIOS[rel.tipoServico as keyof typeof TITULOS_RELATORIOS]}</div>
        <div class="service-period">${formatPeriodForServicePage(rel)}</div>
        <div class="service-subregion">${SUB_REGIOES[('sub' in rel ? rel.sub : 'secoes' in rel ? rel.secoes[0].sub : 'SP') as keyof typeof SUB_REGIOES] || ('sub' in rel ? rel.sub : 'secoes' in rel ? rel.secoes[0].sub : 'SP')}</div>
        <div class="final-bottom-line"></div>
    </div>
    
    ${(() => {
      // Obter fotos baseado no tipo de relatório
      let fotos: any[] = [];
      if ('fotos' in rel && rel.fotos) {
        // Ordenar fotos pela ordem de upload
        fotos = rel.fotos.sort((a, b) => {
          const ordemA = a.ordem || 0;
          const ordemB = b.ordem || 0;
          return ordemA - ordemB;
        });
      }
      
      if (fotos.length === 0) return '';
      
      const totalPages = Math.ceil(fotos.length / 3);
      let html = '';
      
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * 3;
        const endIndex = startIndex + 3;
        const pagePhotos = fotos.slice(startIndex, endIndex);
        const isFirstPage = pageIndex === 0;
        
        if (pagePhotos.length > 0) {
          html += `
          <!-- PÁGINA FOTOGRÁFICA ${pageIndex + 1} -->
          <div class="page content-page">
        <div class="photo-header">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
              
              ${(isFirstPage || rel.tipoServico === 'ACUMULADOR' || rel.tipoServico === 'ALAGAMENTOS') ? `
              <div class="photo-descriptors">
                  <div class="descriptor-item">
                      <strong>PREFEITURA REGIONAL:</strong> ${SUB_REGIOES[('sub' in rel ? rel.sub : 'secoes' in rel ? rel.secoes[0].sub : 'SP') as keyof typeof SUB_REGIOES] || ('sub' in rel ? rel.sub : 'secoes' in rel ? rel.secoes[0].sub : 'SP')}
                  </div>
                  <div class="descriptor-item">
                      <strong>Serviço(s):</strong> ${TIPOS_SERVICO[rel.tipoServico as keyof typeof TIPOS_SERVICO]}
                  </div>
                  <div class="descriptor-item">
                      <strong>Local / Evento:</strong> ${('local' in rel ? rel.local : 'endereco' in rel ? rel.endereco : 'N/A')}
                  </div>
                  <div class="descriptor-item">
                      <strong>Descrição:</strong> ${('descricao' in rel ? rel.descricao : 'N/A')}
                  </div>
                  <div class="descriptor-item">
                      <strong>Período/ Data:</strong> ${
                        (() => {
                          let dateStr = '';
                          // Para evitar problemas de timezone, sempre adicionar 'T00:00:00'
                          if ('data' in rel && rel.data) {
                            const d = new Date(rel.data + 'T00:00:00');
                            dateStr = d.toLocaleDateString('pt-BR');
                          } else if ('dataInicio' in rel && rel.dataInicio) {
                            const d = new Date(rel.dataInicio + 'T00:00:00');
                            dateStr = d.toLocaleDateString('pt-BR');
                          }
                          return dateStr;
                        })()
                      }
                  </div>
              </div>
              ` : ''}
              
              <div class="photos-grid ${pagePhotos.length === 1 ? 'one-photo' : pagePhotos.length === 2 ? 'two-photos' : 'three-photos'}">
                  ${pagePhotos.map((foto, index) => `
                      <div class="photo-item">
                          <div class="photo-container">
                              <img src="${foto.url}" alt="Foto ${startIndex + index + 1}" />
                          </div>
                          ${foto.descricao ? `<div class="photo-description">${foto.descricao}</div>` : ''}
                      </div>
                  `).join('')}
              </div>
          </div>
          `;
        }
      }
      
      return html;
    })()}
    
    <!-- PÁGINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `;
}

// Função principal para exportar PDF de evidências
export async function exportEvidenciasPdf(rel: Relatorio): Promise<Uint8Array> {
  console.log('🔄 Iniciando exportEvidenciasPdf para:', rel.tipoServico);
  
  const config = await getPuppeteerConfig();
  const browser = await puppeteer.launch(config);
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 }); // A4 landscape em pixels
    
    // Configurar timeout para imagens
    await page.setDefaultTimeout(30000);
    
    const html = generateEvidenciasHTML(rel);
    console.log('📄 HTML gerado, tamanho:', html.length);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    console.log('📄 Conteúdo carregado');
    
    // Aguardar carregamento de imagens de forma mais robusta
    try {
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.complete);
      }, { timeout: 10000 });
      console.log('✅ Todas as imagens carregadas');
    } catch (imgError) {
      console.warn('⚠️ Timeout no carregamento de imagens, continuando...');
    }
    
    // Aguardar um pouco mais para garantir estabilidade
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔄 Gerando PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
    
    console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length);
    return new Uint8Array(pdfBuffer);
  } catch (error) {
    console.error('❌ Erro na exportEvidenciasPdf:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser fechado');
  }
}
