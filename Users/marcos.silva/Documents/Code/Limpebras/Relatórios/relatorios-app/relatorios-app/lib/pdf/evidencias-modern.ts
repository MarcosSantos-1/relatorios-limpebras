import puppeteer from 'puppeteer-core';
import { getPuppeteerConfig } from '@/lib/puppeteer-config';
import type { Relatorio, RegistroRelatorio, RevitalizacaoRelatorio } from '@/lib/types';
import { SUB_REGIOES, TIPOS_SERVICO, TITULOS_RELATORIOS } from '@/lib/types';
import { getImageUrls } from './image-loader';
import { formatPeriodForServicePage } from '@/lib/utils';

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

// Função para formatar data para a capa
function formatDateForCover(date: string | Date): string {
  if (!date) return 'São Paulo, Data não informada';
  
  const d = new Date(date);
  
  // Verificar se a data é válida
  if (isNaN(d.getTime())) {
    return 'São Paulo, Data não informada';
  }
  
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d.getFullYear();
  return `São Paulo, ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
}

// Função para gerar HTML do relatório de eventos
function generateEventosHTML(rel: Relatorio): string {
  const images = getImageUrls();
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Eventos</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');
        
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: white;
        }
        
        .page {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* Capa */
        .cover {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }
        
        .cover h1 {
            font-family: 'Anton', sans-serif;
            font-size: 3rem;
            margin: 0 0 2rem 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .cover h2 {
            font-size: 1.5rem;
            margin: 0 0 1rem 0;
            font-weight: 300;
        }
        
        .cover .date {
            font-size: 1.2rem;
            margin: 2rem 0;
            opacity: 0.9;
        }
        
        .cover .logo {
            position: absolute;
            bottom: 2rem;
            right: 2rem;
            width: 120px;
            height: auto;
        }
        
        /* Contra capa */
        .back-cover {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }
        
        .back-cover h1 {
            font-family: 'Anton', sans-serif;
            font-size: 4rem;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        /* Página de conteúdo */
        .content-page {
            background: white;
            padding: 2rem;
            color: #1f2937;
        }
        
        .content-page h1 {
            font-family: 'Anton', sans-serif;
            font-size: 2.5rem;
            color: #1e40af;
            margin: 0 0 2rem 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .info-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .info-item h3 {
            font-size: 0.9rem;
            color: #6b7280;
            margin: 0 0 0.5rem 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-item p {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }
        
        .description {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        
        .description h3 {
            font-size: 1.1rem;
            color: #1e40af;
            margin: 0 0 1rem 0;
            font-weight: 600;
        }
        
        .description p {
            font-size: 1rem;
            line-height: 1.6;
            color: #374151;
            margin: 0;
        }
        
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .photo-item {
            text-align: center;
        }
        
        .photo-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .photo-caption {
            font-size: 10px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 0.5rem;
            text-align: center;
            line-height: 1.2;
        }
        
        .no-photos {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <!-- Capa -->
    <div class="page cover">
        <h1>RELATÓRIO DE EVENTOS</h1>
        <h2>${SUB_REGIOES[rel.sub] || rel.sub}</h2>
        <div class="date">${formatDateForCover(rel.dataInicio || rel.data)}</div>
        <img src="${images.logo}" alt="Logo" class="logo">
    </div>
    
    <!-- Contra capa -->
    <div class="page back-cover">
        <h1>EVENTO</h1>
    </div>
    
    <!-- Página de conteúdo -->
    <div class="page content-page">
        <h1>EVENTO</h1>
        
        <div class="info-grid">
            <div class="info-item">
                <h3>Período</h3>
                <p>${formatPeriodForServicePage(rel)}</p>
            </div>
            <div class="info-item">
                <h3>Sub-região</h3>
                <p>${SUB_REGIOES[rel.sub] || rel.sub}</p>
            </div>
            <div class="info-item">
                <h3>Local</h3>
                <p>${rel.local || 'Não informado'}</p>
            </div>
            <div class="info-item">
                <h3>Nome do Evento</h3>
                <p>${rel.nomeEvento || 'Não informado'}</p>
            </div>
        </div>
        
        ${rel.descricao ? `
        <div class="description">
            <h3>Descrição</h3>
            <p>${rel.descricao}</p>
        </div>
        ` : ''}
        
        ${rel.fotos && rel.fotos.length > 0 ? `
        <div class="photos-grid">
            ${rel.fotos.map(foto => `
                <div class="photo-item">
                    <img src="${foto.url}" alt="Foto do evento">
                    <div class="photo-caption">${rel.nomeEvento || 'Evento'}</div>
                </div>
            `).join('')}
        </div>
        ` : `
        <div class="no-photos">
            Nenhuma foto disponível para este evento.
        </div>
        `}
    </div>
</body>
</html>`;
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
            <div class="cover-date">${formatDateForCover(rel.tipoServico === 'DDS' ? rel.dataInicio : ('data' in rel ? rel.data : rel.dataInicio))}</div>
        </div>
    </div>
    
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">${TITULOS_RELATORIOS[rel.tipoServico as keyof typeof TITULOS_RELATORIOS]}</div>
        <div class="service-period">${formatPeriodForServicePage(rel)}</div>
        <div class="service-subregion">${(() => {
          let subCode = 'SP';
          if ('sub' in rel) {
            subCode = rel.sub;
          } else if ('secoes' in rel && rel.secoes && rel.secoes.length > 0) {
            subCode = rel.secoes[0].sub;
          }
          console.log('🔍 Debug evidencias-modern - subCode:', subCode, 'SUB_REGIOES[subCode]:', SUB_REGIOES[subCode as keyof typeof SUB_REGIOES]);
          return SUB_REGIOES[subCode as keyof typeof SUB_REGIOES] || subCode;
        })()}</div>
        <div class="final-bottom-line"></div>
    </div>
    
    ${(() => {
      // Obter fotos baseado no tipo de relatório
      let fotos: any[] = [];
      if ('fotos' in rel && rel.fotos) {
        if (rel.tipoServico === 'DDS') {
          // Para DDS, agrupar por descritivo e manter ordem dentro do grupo
          const fotosAgrupadas = rel.fotos.reduce((acc, foto) => {
            const descricao = foto.descricao || 'Sem descrição';
            if (!acc[descricao]) {
              acc[descricao] = [];
            }
            acc[descricao].push(foto);
            return acc;
          }, {} as Record<string, any[]>);
          
          // Converter de volta para array, mantendo ordem dos grupos
          fotos = Object.values(fotosAgrupadas).flat();
        } else {
          // Para outros tipos, ordenar fotos pela ordem de upload
          fotos = rel.fotos.sort((a, b) => {
            const ordemA = a.ordem || 0;
            const ordemB = b.ordem || 0;
            return ordemA - ordemB;
          });
        }
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
              
              ${(isFirstPage || rel.tipoServico === 'ACUMULADOR' || rel.tipoServico === 'ALAGAMENTOS' || rel.tipoServico === 'DDS') ? `
              <div class="photo-descriptors">
                  <div class="descriptor-item">
                      <strong>PREFEITURA REGIONAL:</strong> ${SUB_REGIOES[('sub' in rel ? rel.sub : 'secoes' in rel ? rel.secoes[0].sub : 'SP') as keyof typeof SUB_REGIOES] || ('sub' in rel ? rel.sub : 'secoes' in rel ? rel.secoes[0].sub : 'SP')}
                  </div>
                  <div class="descriptor-item">
                      <strong>Serviço(s):</strong> ${TIPOS_SERVICO[rel.tipoServico as keyof typeof TIPOS_SERVICO]}
                  </div>
                  ${rel.tipoServico !== 'DDS' ? `
                  <div class="descriptor-item">
                      <strong>Local / Evento:</strong> ${('local' in rel ? rel.local : 'endereco' in rel ? rel.endereco : 'N/A')}
                  </div>
                  ${rel.tipoServico === 'REVITALIZACAO' ? `
                  <div class="descriptor-item">
                      <strong>Peso:</strong> ${('peso' in rel ? rel.peso : 'N/A')}
                  </div>
                  <div class="descriptor-item">
                      <strong>Frequência:</strong> ${('frequencia' in rel ? rel.frequencia : 'N/A')}
                  </div>
                  ` : `
                  <div class="descriptor-item">
                      <strong>Descrição:</strong> ${('descricao' in rel ? rel.descricao : 'N/A')}
                  </div>
                  `}
                  ` : ''}
                  <div class="descriptor-item">
                      <strong>Período/ Data:</strong> ${
                        (() => {
                          // Sempre tentar mostrar período (data início a data fim), se ambos existirem e forem diferentes
                           const dataInicio = ('dataInicio' in rel && rel.dataInicio) ? rel.dataInicio : ('data' in rel && rel.data ? rel.data : null);
                           const dataFim = ('dataFim' in rel && rel.dataFim) ? rel.dataFim : null;

                          // Se não houver dataFim, mas houver dataInicio, mostrar só a dataInicio
                          if (dataInicio && dataFim && dataInicio !== dataFim) {
                            const dInicio = new Date(dataInicio + 'T00:00:00');
                            const dFim = new Date(dataFim + 'T00:00:00');
                            return `${dInicio.toLocaleDateString('pt-BR')} a ${dFim.toLocaleDateString('pt-BR')}`;
                          } else if (dataInicio) {
                            const d = new Date(dataInicio + 'T00:00:00');
                            return `${d.toLocaleDateString('pt-BR')} a ${d.toLocaleDateString('pt-BR')}`;
                          }
                          return 'Data não informada';
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
  
  // Usar puppeteer completo se disponível, senão usar puppeteer-core
  const puppeteerToUse = puppeteerDev || puppeteer;
  const browser = await puppeteerToUse.launch(config);
  
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
      }, { timeout: 300000 }); // 5 minutos para carregar HTML com muitas imagens
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

// Função para exportar PDF de eventos
export async function exportEventosPdf(rel: Relatorio): Promise<Uint8Array> {
  console.log('🎯 Iniciando exportEventosPdf para:', rel.tipoServico);
  
  const config = await getPuppeteerConfig();
  
  // Usar puppeteer completo se disponível, senão usar puppeteer-core
  const puppeteerToUse = puppeteerDev || puppeteer;
  const browser = await puppeteerToUse.launch(config);
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 });
    await page.setDefaultTimeout(30000);
    
    const html = generateEventosHTML(rel);
    console.log('📄 HTML gerado, tamanho:', html.length);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    console.log('📄 Conteúdo carregado');
    
    try {
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.complete);
      }, { timeout: 300000 });
      console.log('✅ Todas as imagens carregadas');
    } catch (imgError) {
      console.warn('⚠️ Timeout no carregamento de imagens, continuando...');
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔄 Gerando PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length);
    return new Uint8Array(pdfBuffer);
  } catch (error) {
    console.error('❌ Erro na exportEventosPdf:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser fechado');
  }
}


