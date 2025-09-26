import puppeteer from 'puppeteer-core';
import { getPuppeteerConfig } from '@/lib/puppeteer-config';
import type { MutiraoRelatorio, RegistroRelatorio, RevitalizacaoRelatorio, Relatorio } from '@/lib/types';
import { SUB_REGIOES, TIPOS_SERVICO, TITULOS_RELATORIOS } from '@/lib/types';
import { getImageUrls } from './image-loader';
import { formatDateForPhotos, formatPeriodForPhotos, formatPeriodForServicePage } from '@/lib/utils';

// Função para formatar data para a capa
function formatDateForCover(date: string | Date): string {
  let d: Date;
  
  if (typeof date === 'string') {
    // Parse manual para evitar problemas de fuso horário
    if (date.includes('/')) {
      const parts = date.split('/');
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
      const year = parseInt(parts[2]);
      d = new Date(year, month, day);
    } else {
      // Formato ISO (YYYY-MM-DD)
      const parts = date.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
      const day = parseInt(parts[2]);
      d = new Date(year, month, day);
    }
  } else {
    d = date;
  }
  
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d.getFullYear();
  return `São Paulo, ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
}

// Função para obter o título do serviço baseado no tipo
function getServiceTitle(tipoServico: string): string {
  return TITULOS_RELATORIOS[tipoServico as keyof typeof TITULOS_RELATORIOS] || 'RELATÓRIO DE SERVIÇO';
}

// Função para obter a sub-região baseada no tipo de relatório
function getSubRegion(rel: Relatorio): string {
  if ('sub' in rel) {
    return SUB_REGIOES[rel.sub as keyof typeof SUB_REGIOES] || rel.sub;
  }
  if ('secoes' in rel && rel.secoes.length > 0) {
    return SUB_REGIOES[rel.secoes[0].sub as keyof typeof SUB_REGIOES] || rel.secoes[0].sub;
  }
  return 'N/A';
}

// Função para obter a data baseada no tipo de relatório
function getReportDate(rel: Relatorio): string {
  // Para DDS, usar apenas dataInicio (mês inicial)
  if (rel.tipoServico === 'DDS' && 'dataInicio' in rel && rel.dataInicio) {
    return formatDateForCover(rel.dataInicio);
  }
  
  // Para outros tipos, verificar se data é uma data válida (não contém " a ")
  if ('data' in rel && rel.data && !rel.data.includes(' a ')) {
    return formatDateForCover(rel.data);
  }
  
  // Fallback para dataInicio/dataTermino
  if ('dataInicio' in rel && 'dataTermino' in rel) {
    if (rel.dataInicio && rel.dataTermino) {
      if (rel.dataInicio === rel.dataTermino) {
        return formatDateForCover(rel.dataInicio);
      }
      return `${formatDateForCover(rel.dataInicio)} a ${formatDateForCover(rel.dataTermino)}`;
    }
    if (rel.dataInicio) {
      return formatDateForCover(rel.dataInicio);
    }
  }
  
  return formatDateForCover(new Date());
}

// Função para gerar HTML unificado para todos os tipos de relatório
function generateUnifiedHTML(rel: Relatorio): string {
  const images = getImageUrls();
  const serviceTitle = getServiceTitle(rel.tipoServico);
  const subRegion = getSubRegion(rel);
  const reportDate = getReportDate(rel);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de ${TIPOS_SERVICO[rel.tipoServico as keyof typeof TIPOS_SERVICO]}</title>
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
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .page {
            width: 297mm;
            height: 210mm;
            position: relative;
            overflow: hidden;
        }
        
        .page.cover-page,
        .page.service-page,
        .page.content-page {
            page-break-after: always;
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
            right: 50px;
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
            right: 80px;
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
            bottom: 0px;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* PÁGINA DE CONTEÚDO */
        .content-page {
            min-height: 210mm;;
        }
        .largura-fotografico {
            padding: 0px 60px 30px 30px;
        }

        .content-header {
            padding: 10px 20px;
            margin: 0 0 10px 0;
        }
        
        .content-header h2 {
            font-size: 20px;
            font-weight: bold;
        }
        
        .content-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .content-info h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .content-info p {
            margin: 5px 0;
            color: #555;
        }
        
        /* GRID DE FOTOS DINÂMICO PARA REVITALIZAÇÃO - REFATORADO */
        .photos-grid {
            display: grid;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
            align-items: start;
            width: 100%;
            max-width: 100%;
        }
        
        /* Grid unificado - sempre 3 colunas */
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
        
        /* Container da foto */
        .photo-item {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        
        .photo-container {
            width: 100%;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 8px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Alturas dinâmicas baseadas no número de fotos - OTIMIZADAS PARA A4 LANDSCAPE */
        .photos-grid.one-photo .photo-container {
            min-height: 320px;
            max-height: 380px;
        }
        
        .photos-grid.two-photos .photo-container {
            min-height: 320px;
            max-height: 380px;
        }
        
        .photos-grid.three-photos .photo-container {
            min-height: 320px;
            max-height: 380px;
        }
        
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        
        .photo-description {
            font-size: 11px ;
            color: #2c3e50;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 5px;
            text-align: center;
            line-height: 1.2;
        }
        
        /* CABEÇALHO DA PÁGINA FOTOGRÁFICA */
        .photo-page-header {
            position: relative;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            /* Removido page-break-after e break-after */
        }
        
        .photo-page-header h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
        }
        
        .photo-logo {
            width: 40px;
            height: 40px;
            background: url('${images.logo}') center/contain no-repeat;
        }
        
        /* DESCRITORES */
        .photo-descriptors {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 12px;
            line-height: 1.0;
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
        .photo-header-with-logos {
            position: relative;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 60px;
            /* Removido page-break-after e break-after */
        }
        
        .photo-header-with-logos h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            flex: 1;
            text-align: center;
        }
        
        .prefeitura-logo {
            width: 120px;
            height: 120px;
            background: url('${images.prefeitura}') center/contain no-repeat;
            margin-right: 20px;
        }
        
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${images.logo}') center/contain no-repeat;
            margin-left: 20px;
        }

        /* Controle específico para seção fotográfica */
        @media print {
            .content-page {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photos-grid {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photo-item {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photo-container {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photo-page-header,
            .photo-header-with-logos,
            .photo-descriptors {
                page-break-after: avoid;
                break-after: avoid;
            }
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
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            /* Evitar quebras dentro de elementos importantes */
            .photo-header-with-logos,
            .photo-descriptors {
                page-break-after: avoid;
                break-after: avoid;
            }
            
            /* Controle específico para seção fotográfica */
            .content-page {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photos-grid {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photo-item {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .photo-container {
                page-break-inside: avoid;
                break-inside: avoid;
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
            <h1 class="cover-title">RELATÓRIO DE <br> EVIDÊNCIAS</h1>
            <div class="cover-date">${reportDate}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">${serviceTitle}</div>
        <div class="service-period">${formatPeriodForServicePage(rel)}</div>
        <div class="service-subregion">${subRegion}</div>
        <div class="service-footer-line"></div>
    </div>
    
    ${rel.tipoServico !== 'MUTIRAO' && 'fotos' in rel && rel.fotos && rel.fotos.length > 0 ? `
    ${(() => {
      // Ordenar fotos pela ordem de upload
      const fotosOrdenadas = rel.fotos.sort((a, b) => {
        const ordemA = a.ordem || 0;
        const ordemB = b.ordem || 0;
        return ordemA - ordemB;
      });
      
      const totalPages = Math.ceil(fotosOrdenadas.length / 3);
      let html = '';
      
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * 3;
        const endIndex = startIndex + 3;
        const pagePhotos = fotosOrdenadas.slice(startIndex, endIndex);
        const isFirstPage = pageIndex === 0;
        
        // Só criar página se houver fotos
        if (pagePhotos.length > 0) {
          html += `
          <!-- PÁGINA FOTOGRÁFICA ${pageIndex + 1} -->
          <div class="page content-page">
            <div class="largura-fotografico"> 
           

              <div class="photo-header-with-logos">
                  <div class="prefeitura-logo"></div>
                  <div class="company-logo"></div>
              </div>
              
              ${(isFirstPage || rel.tipoServico === 'ACUMULADOR' || rel.tipoServico === 'ALAGAMENTOS' || rel.tipoServico === 'DDS') ? `
              <div class="photo-descriptors">
                  <div class="descriptor-item">
                      <strong>PREFEITURA REGIONAL:</strong> ${subRegion}
                  </div>
                  <div class="descriptor-item">
                      <strong>Serviço(s):</strong> ${rel.tipoServico === 'ACUMULADOR' ? 'Ação Acumulador: Coleta e Limpeza' : TIPOS_SERVICO[rel.tipoServico as keyof typeof TIPOS_SERVICO]}
                  </div>
                  ${rel.tipoServico !== 'DDS' ? `
                  <div class="descriptor-item">
                      <strong>Local / Evento:</strong> ${rel.tipoServico === 'REVITALIZACAO' && 'local' in rel ? rel.local : ('endereco' in rel ? rel.endereco : 'N/A')}
                  </div>
                  ` : ''}
                  ${rel.tipoServico === 'REVITALIZACAO' ? `
                  <div class="descriptor-item">
                      <strong>Frequência:</strong> ${'frequencia' in rel ? rel.frequencia : 'N/A'}
                  </div>
                  <div class="descriptor-item">
                      <strong>Peso Coletado:</strong> ${'peso' in rel && typeof rel.peso === 'string' && rel.peso.trim() !== '' ? rel.peso : 'N/A'}
                  </div>
                  ` : rel.tipoServico !== 'DDS' ? `
                  <div class="descriptor-item">
                      <strong>Descrição:</strong> ${'descricao' in rel ? rel.descricao : 'N/A'}
                  </div>
                  ` : ''}
                  <div class="descriptor-item">
                      <strong>${rel.tipoServico === 'DDS' ? 'Período:' : 'Período/ Data:'}</strong> ${('dataInicio' in rel && 'dataTermino' in rel && rel.dataInicio && rel.dataTermino)
                        ? formatPeriodForPhotos(rel.dataInicio, rel.dataTermino)
                        : ('data' in rel && rel.data)
                        ? formatDateForPhotos(rel.data)
                        : formatDateForPhotos(new Date().toLocaleDateString('pt-BR'))
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
                          ${foto.descricao || ('etapa' in foto ? foto.etapa : '') ? `<div class="photo-description">${foto.descricao || ('etapa' in foto ? foto.etapa : '')}</div>` : ''}
                      </div>
                  `).join('')}
              </div>
            </div>

          </div>
          `;
        }
      }
      
      return html;
    })()}
    ` : ''}
    
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

// Função principal para exportar qualquer tipo de relatório
export async function exportUnifiedPdf(rel: Relatorio): Promise<Uint8Array> {
  const config = await getPuppeteerConfig();
  const browser = await puppeteer.launch(config);
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 }); // A4 landscape em pixels
    
    const html = generateUnifiedHTML(rel);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Aguardar um pouco mais para garantir que as imagens carregaram
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
    
    return new Uint8Array(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * ========================================
 * RELATÓRIO CONSOLIDADO DE REVITALIZAÇÕES
 * ========================================
 */

// Função para gerar HTML do relatório consolidado de revitalizações
export function generateRevitalizacoesConsolidadoHTML(revitalizacoes: RevitalizacaoRelatorio[], mesAno: string): string {
  const images = getImageUrls();

  // Agrupar revitalizações por sub-região
  const revitalizacoesPorSub = revitalizacoes.reduce((acc: Record<string, RevitalizacaoRelatorio[]>, rev) => {
    if (!acc[rev.sub]) {
      acc[rev.sub] = [];
    }
    acc[rev.sub].push(rev);
    return acc;
  }, {});

  // Ordem das sub-regiões
  const ordemSubs = ['CV', 'JT', 'MG', 'ST', 'SP'];
  const subsOrdenadas = ordemSubs.filter(sub => revitalizacoesPorSub[sub]);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Consolidado de Revitalizações</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');
        
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .page {
            width: 297mm;
            min-height: 210mm;
            margin: 0 auto;
            background: white;
            position: relative;
        }
        
        .page.cover-page,
        .page.service-page,
        .page.content-page {
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
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
            right: 50px;
            text-align: center;
            margin: 0;
        }
        
        .cover-date {
            font-size: 26px;
            color: rgb(0, 48, 107);
            font-weight: bold;
            position: absolute;
            right: 80px;
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
        }
        
        .service-logo {
            position: absolute;
            top: -70px;
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            height: 280px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 2;
        }
        
        .service-title {
            font-family: 'Anton', sans-serif;
            font-size: 48px;
            font-weight: 600;
            color: rgb(0, 48, 107);
            text-transform: uppercase;
            line-height: 1.2;
            margin-bottom: 20px;
            z-index: 3;
            position: relative;
        }
        
        .service-period {
            font-size: 24px;
            color: rgb(0, 48, 107);
            font-weight: bold;
            margin-bottom: 15px;
            z-index: 3;
            position: relative;
        }
        
        .service-subregion {
            font-size: 28px;
            color: rgb(0, 48, 107);
            font-weight: bold;
            text-transform: uppercase;
            z-index: 3;
            position: relative;
        }
        
        .service-footer-line {
            position: absolute;
            bottom: 0px;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* SEÇÃO FOTOGRÁFICA */
        .content-page {
            page-break-before: always;
            position: relative;
            width: 100%;
            min-height: calc(210mm - 0px);
            break-inside: avoid;
            page-break-inside: avoid;
            background: #fff !important;
        }
        .largura-fotografico {
            padding: 0px 60px 30px 30px;
        }
        
        .photo-page-header {
            background: #fff !important;
            color: #00306b;
            padding: 15px 20px 0 20px;
            text-align: left;
            break-after: avoid;
            page-break-after: avoid;
        }
        
        .photo-page-header p {
            font-size: 12px;
            opacity: 0.9;
            color: #00306b;
            margin-bottom: 0;
        }
        .photo-header-with-logos {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff !important;
            padding: 20px 60px 0 30px;
            break-after: avoid;
            page-break-after: avoid;
        }
        .prefeitura-logo {
            width: 120px;
            height: 120px;
            background: url('${images.prefeitura}') center/contain no-repeat;
        }
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${images.logo}') center/contain no-repeat;
        }
        .photo-descriptors {
            background: #fff !important;
            padding: 15px 20px 10px 20px;
            font-size: 12px;
            break-after: avoid;
            page-break-after: avoid;
            margin-bottom: 10px;
        }
       
        /* GRID DINÂMICO PARA FOTOS */
        .photos-grid {
            display: grid;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
            align-items: start;
            width: 100%;
            max-width: 100%;
            padding: 20px;
            break-inside: avoid;
            page-break-inside: avoid;
            background: #fff !important;
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
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            break-inside: avoid;
            page-break-inside: avoid;
            background: #fff !important;
        }
        .photo-container {
            width: 100%;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 8px;
            background: #fff !important;
            display: flex;
            align-items: center;
            justify-content: center;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        .photos-grid.one-photo .photo-container {
            min-height: 320px;
            max-height: 380px;
        }
        .photos-grid.two-photos .photo-container {
            min-height: 320px;
            max-height: 380px;
        }
        .photos-grid.three-photos .photo-container {
            min-height: 320px;
            max-height: 380px;
        }
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            background: #fff !important;
        }
        .photo-caption {
            font-size: 12px;
            color: #666;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            background: #fff !important;
        }
        .photo-description {
            font-size: 11px;
            color: #555;
            text-align: center;
            font-style: italic;
            background: #fff !important;
        }
        /* PÁGINA FINAL */
        .final-page {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
        }
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        .final-logo {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 18cm;
            height: 18cm;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 5;
        }
        .final-bottom-line {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
            .page.cover-page,
            .page.service-page,
            .page.content-page {
                page-break-after: always;
            }
            .page:last-child {
                page-break-after: avoid;
            }
            .photo-page-header,
            .photo-header-with-logos,
            .photo-descriptors {
                page-break-after: avoid;
                break-after: avoid;
            }
            .content-page,
            .photos-grid,
            .photo-item,
            .photo-container {
                page-break-inside: avoid;
                break-inside: avoid;
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
            <h1 class="cover-title">RELATÓRIO DE <br> EVIDÊNCIAS</h1>
            <div class="cover-date">São Paulo, ${mesAno}</div>
        </div>
    </div>
    
    <!-- CONTRA CAPA -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELATÓRIO DE REVITALIZAÇÃO DE <br> PONTOS VICIADOS</div>
        <div class="service-subregion">EVIDÊNCIAS CONSOLIDADAS</div>
        <div class="service-period">${mesAno}</div>
        <div class="service-footer-line"></div>
    </div>
    
    ${subsOrdenadas.map(sub => {
        const revitalizacoesSub = revitalizacoesPorSub[sub];
        const subNome = SUB_REGIOES[sub as keyof typeof SUB_REGIOES];
        
        return `
        <!-- CONTRA CAPA ${subNome} -->
        <div class="page service-page">
            <div class="service-logo"></div>
            <div class="service-title">REVITALIZAÇÕES</div>
            <div class="service-subregion">${subNome}</div>
            <div class="service-period">${mesAno}</div>
            <div class="service-footer-line"></div>
        </div>
        
        ${revitalizacoesSub.map(rev => {
            const fotos = rev.fotos || [];
            const fotosCount = fotos.length;
            const gridClass = fotosCount === 1 ? 'one-photo' : fotosCount === 2 ? 'two-photos' : 'three-photos';
            
            return `
            <!-- SEÇÃO FOTOGRÁFICA - ${rev.local} -->
            <div class="page content-page">
                <div class="largura-fotografico">
                    <div class="photo-header-with-logos">
                        <div class="prefeitura-logo"></div>
                        <div class="company-logo"></div>
                    </div>
                    
                    <div class="photo-descriptors">
                        <div class="descriptor-item">
                            <strong>PREFEITURA REGIONAL:</strong> ${subNome}
                        </div>
                        <div class="descriptor-item">
                            <strong>Serviço(s):</strong> Revitalização de Pontos Viciados
                        </div>
                        <div class="descriptor-item">
                            <strong>Local / Evento:</strong> ${rev.local}
                        </div>
                        <div class="descriptor-item">
                            <strong>Frequência:</strong> ${rev.frequencia || 'N/A'}
                        </div>
                        <div class="descriptor-item">
                            <strong>Peso Coletado:</strong> ${rev.peso || 'N/A'}
                        </div>
                        <div class="descriptor-item">
                            <strong>Período/ Data:</strong> ${new Date(rev.data).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                    
                    <div class="photos-grid ${gridClass}">
                        ${fotos.map(foto => `
                            <div class="photo-item">
                                <div class="photo-container">
                                    <img src="${foto.url}" alt="${foto.etapa}" />
                                </div>
                                ${foto.descricao || foto.etapa ? `<div class="photo-description">${foto.descricao || foto.etapa}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            `;
        }).join('')}
        `;
    }).join('')}
    
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

// Função para gerar PDF consolidado de revitalizações
export async function exportRevitalizacoesConsolidadoPdf(revitalizacoes: RevitalizacaoRelatorio[], mesAno: string): Promise<Uint8Array> {
  const config = await getPuppeteerConfig();
  const browser = await puppeteer.launch(config);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 }); // A4 landscape em pixels

    // Gerar HTML
    const html = generateRevitalizacoesConsolidadoHTML(revitalizacoes, mesAno);

    // Carregar HTML na página
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Aguardar um pouco mais para garantir que as imagens carreguem
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Gerar PDF
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

    return new Uint8Array(pdfBuffer);

  } finally {
    await browser.close();
  }
}
