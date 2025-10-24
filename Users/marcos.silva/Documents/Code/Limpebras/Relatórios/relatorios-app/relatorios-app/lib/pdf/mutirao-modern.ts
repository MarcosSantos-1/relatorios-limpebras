/**
 * ========================================
 * GERADOR DE PDF PARA MUTIRÕES - SELIMP
 * ========================================
 * 
 * Este arquivo contém toda a lógica para gerar PDFs de mutirões.
 * 
 * ESTRUTURA DO PDF:
 * 1. Capa (título, data, quantitativo)
 * 2. Páginas por sub-região:
 *    - Informações da sessão
 *    - Foto da equipe (se disponível)
 *    - Foto do mapa (se disponível) 
 *    - Tabela de informações
 *    - Páginas fotográficas por serviço
 * 
 * FUNÇÕES PRINCIPAIS:
 * - exportMutiraoPdf(): PDF individual por sub-região
 * - exportEvidenciasMutiroesPdf(): PDF consolidado de múltiplas sub-regiões
 * - exportRegistroPdf(): PDF para registros fotográficos
 * 
 * PERSONALIZAÇÃO CSS:
 * - Todos os estilos estão inline para facilitar edição
 * - Use @page para configurações de página
 * - Classes principais: .page, .cover-page, .subregion-page, .service-photo-page
 */

import puppeteer from 'puppeteer-core';
import { getPuppeteerConfig } from '@/lib/puppeteer-config';

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
import type { MutiraoRelatorio, RegistroRelatorio, RevitalizacaoRelatorio, Relatorio } from "@/lib/types";
import { SUB_REGIOES } from "@/lib/types";
import { formatDateForCover, formatDateForPhotos, formatPeriodForServicePage } from "@/lib/utils";
import { getImageUrls } from "./image-loader";

/**
 * ========================================
 * GERAÇÃO DE HTML PARA MUTIRÃO INDIVIDUAL
 * ========================================
 */
export function generateMutiraoHTML(rel: MutiraoRelatorio): string {
    const images = getImageUrls();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Mutirão</title>
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
            width: 297mm; /* A4 landscape */
            min-height: 210mm;
            margin: 0 auto;
            background: white;
            position: relative;
        }
        
        .page.cover-page,
        .page.service-page,
        .page.quantitative-page {
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* PÁGINA DE CAPA */
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
        
        .cover-logo {
            position: absolute;
            top: -90px;
            right: 80px;
            width: 330px;
            height: 330px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 3;
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
            position: relative;
            width: 100%;
            height: 210mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
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
            
        /* PÁGINA DE QUANTITATIVO (CONSOLIDADO) */
        .quantitative-page {
            min-height: 210mm;
            padding: 40px 60px 20px 40px;
            position: relative;
        }

        .quantitative-header-line {
            display: flex;
            position: relative;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 40px;
            z-index: 10;
            margin-bottom: 20px;
        }

        .quantitative-header-line .prefeitura-logo {
            width: 120px;
            height: 80px;
            background: url('${images.prefeitura}') center/contain no-repeat;
            background-size: contain;
        }

        .quantitative-header-line .company-logo {
            width: 120px;
            height: 80px;
            background: url('${images.logo}') center/contain no-repeat;
            background-size: contain;
        }

        .quantitative-header {
            background: #304057;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
            text-align: center;
        }

        .quantitative-header h2 {
            font-size: 22px;
            font-weight: bold;
            margin: 0;
            text-align: center;
        }

        .quantitative-header-total {
            background: #00255f;
            color: white;
            padding: 15px 20px;
            margin: 0 0 5px 0;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .subprefeituras-list {
            color: #2c3e50;
            padding: 5px 20px;
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
        }

        .quantitative-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            font-size: 15px;
        }

        .quantitative-table th,
        .quantitative-table td {
            border: 1px solid #ddd;
            padding: 12px 20px;
            text-align: center;
        }

        .quantitative-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }

        .quantitative-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* PÁGINA DE CAPA DA Subprefeitura - CÓPIA DA CONTRACAPA */
        .subregion-cover-page {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
        }
        
        .subregion-cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${images.cover}') center/cover no-repeat;
            z-index: 1;
        }
        
        .subregion-cover-date {
            font-family: 'Arial', sans-serif;
            font-size: 26px;
            color: white;
            position: absolute;
            right: 80px;
            top: 520px;
            margin-top: 0;
            margin-right: 0;
            text-align: right;
            width: auto;
        }
        
        /* PÁGINA DE Subprefeitura */
        .subregion-page {
            padding: 10mm 60px 10mm 40px;
        }
        
        /* PÁGINA DE DESCRIÇÃO DOS ITENS */
        .items-description-page {
            padding: 10mm 60px 10mm 40px;
        }
        
        .items-description-header {
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
            text-align: center;
        }
        
        .items-description-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        
        .items-description-table th,
        .items-description-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        .items-description-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .items-description-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .subregion-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            margin-top: 20px;
        }
        
        .subregion-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        .subregion-info h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .subregion-info p {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .team-photo {
            text-align: center;
        }
        
        .team-photo img {
            max-width: 450px;
            max-height: 400px;
            width: auto;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            object-fit: contain;
        }
        
        .team-photo-caption {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            font-style: italic;
        }
        
        /* PÁGINA DA TABELA DE INFORMAÇÕES */
        .info-table-page {
            padding: 10mm 60px 10mm 40px;
            min-height: 210mm;
        }
        
        .info-table-header {
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
            text-align: center;
        }
        
        .info-table-header h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            text-align: center;
        }
        
        /* TABELA DE INFORMAÇÕES */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .info-table th,
        .info-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            word-wrap: break-word;
        }
        
        .info-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
        }
        
        .info-table tr {
            /* Quebra de linha natural */
        }
        
        .info-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* PÁGINA DE SERVIÇO FOTOGRÁFICO */
        .service-photo-page {
            padding: 30px 60px 30px 40px;
            position: relative;
        }
        
        .service-photo-header {
            background: rgb(0, 48, 107);
            color: white;
            padding: 20px;

            text-align: center;
        }
        
        .service-photo-header h2 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .service-photo-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid rgb(0, 48, 107);
        }
        
        .service-photo-info p {
            margin-bottom: 10px;
            font-size: 14px;
            color: #333;
        }
        
        .service-photo-info strong {
            color: rgb(0, 48, 107);
            font-weight: bold;
        }
        
        .photo-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-top: 20px;
        }
        
        .photo-item {
            text-align: center;
            border-radius: 12px;
            transition: transform 0.2s ease;
        }
        
        
        .photo-item img {
            max-width: 100%;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
        }
        
        .photo-caption {
            font-size: 14px;
            color: rgb(0, 48, 107);
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* PÁGINA FOTOGRÁFICA SIMPLES */
        .photo-page {
            padding: 10mm 60px 10mm 40px;
            position: relative;
        }
        
        .photo-header {
            background: rgb(0, 48, 107);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .photo-header h2 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .photo-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid rgb(0, 48, 107);
        }
        
        .photo-info p {
            margin-bottom: 10px;
            font-size: 14px;
            color: #333;
        }
        
        .photo-info strong {
            color: rgb(0, 48, 107);
            font-weight: bold;
        }
        
        /* PÁGINA FINAL */
        .final-page {
            position: relative;
            width: 100%;
            height: 210mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
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
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            transform: scaleY(-1);
            z-index: 10;
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
        
        /* GRID DE FOTOS DINÂMICO PARA MUTIRÃO - REFATORADO */
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
            min-height: 380px;
            max-height: 430px;
        }
        
        .photos-grid.two-photos .photo-container {
            min-height: 380px;
            max-height: 430px;
        }
        
        .photos-grid.three-photos .photo-container {
            min-height: 380px;
            max-height: 430px;
        }
        
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        
        .photo-description {
            font-size: 12px;
            color: #2c3e50;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 5px;
            text-align: center;
            line-height: 1.2;
        }
        
        
        /* CABEÇALHO DA PÁGINA FOTOGRÁFICA PARA MUTIRÃO */
        .photo-page-header {
            position: relative;
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
        
        /* DESCRITORES PARA MUTIRÃO */
        .photo-descriptors {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 12px;
            line-height: 1.4;
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
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: -20mm -60px 20px -40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 60px;
        }
        
        .photo-header-with-logos h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            flex: 1;
            text-align: center;
        }
        
        .prefeitura-logo {
            width: 50px;
            height: 50px;
            background: url('${images.prefeitura}') center/contain no-repeat;
            margin-right: 20px;
        }
        
        .company-logo {
            width: 50px;
            height: 50px;
            background: url('${images.logo}') center/contain no-repeat;
            margin-left: 20px;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
            
            /* Configurações específicas para quebra de página */
            .page.cover-page,
            .page.service-page,
            .page.quantitative-page {
                page-break-after: always;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            /* Evitar quebras dentro de elementos importantes */
            .photo-header-with-logos,
            .photo-descriptors,
            .info-table-header {
                page-break-after: avoid;
                break-after: avoid;
            }
            
            /* Controle específico para seção fotográfica */
            .service-photo-page {
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
            
            .info-table {
                page-break-inside: auto;
            }
            
            .info-table tr {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE <br>EVIDÊNCIAS</h1>
            <div class="cover-date">São Paulo, ${new Date(rel.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELATÓRIO OPERAÇÃO <br> SÃO PAULO LIMPA</div>
        <div class="service-period">${formatDateForCover(rel.data)}</div>
        <div class="service-subregion">${rel.secoes.length > 0 ? SUB_REGIOES[rel.secoes[0].sub] : 'N/A'}</div>
        <div class="service-footer-line"></div>
    </div>
    
    <!-- PÁGINA DE QUANTITATIVO -->
    <div class="page quantitative-page">
        <div class="quantitative-header-line">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
        <div class="quantitative-header"> 
            <h2>Quantitativo Estimado</h2>
        </div>
        
        <table class="quantitative-table">
            <thead>
                <tr>
                    <th>Descrição do Serviço</th>
                    <th>Quantidade</th>
                </tr>
            </thead>
            <tbody>
                ${rel.quantitativo.map((q) => {
        let valor = String(q.quantidade ?? "");
        if (!valor.trim()) {
            valor = q.descricao.includes("km") || q.descricao.includes("Ton") ? "0,0" : "0";
        }
        return `
                    <tr>
                        <td>${q.descricao}</td>
                        <td>${valor}</td>
                    </tr>
                  `;
    }).join('')}
            </tbody>
        </table>
    </div>
    
    ${rel.secoes.map((sec, idx) => `
        ${sec.mapaFotoUrl ? `
            <!-- PÁGINA DO MAPA -->
            <div class="page subregion-page">
                <div class="quantitative-header-line">
                    <div class="prefeitura-logo"></div>
                    <div class="company-logo"></div>
                </div>
                <div class="subregion-content">
                    <div class="subregion-info">
                        <h3>Mapa da Operação</h3>
                        <p><strong>Subprefeitura:</strong> ${SUB_REGIOES[sec.sub]}</p>
                        <p><strong>Local/Evento:</strong> ${sec.local ?? "-"}</p>
                        <p><strong>Data:</strong> ${sec.data.split('-').reverse().join('/')}</p>
                        <p><strong>Descrição:</strong> ${sec.descricao || "Nenhuma descrição disponível"}</p>
                    </div>
                    
                    <div class="team-photo">
                        <img src="${sec.mapaFotoUrl}" alt="Mapa da Operação" style="max-width: 400px; max-height: 500px; object-fit: contain;" />
                        <div class="team-photo-caption">Mapa da Operação</div>
                    </div>
                </div>
            </div>
        ` : ''}
        <!-- PÁGINA DA Subprefeitura ${idx + 1} -->
        <div class="page subregion-page">
            <div class="quantitative-header-line">
                <div class="prefeitura-logo"></div>
                <div class="company-logo"></div>
            </div>
            <div class="subregion-content">
                <div class="subregion-info">
                    <h3>Subprefeitura: ${SUB_REGIOES[sec.sub]}</h3>
                    <p><strong>Local/Evento:</strong> ${sec.local ?? "-"}</p>
                    <p><strong>Data:</strong> ${sec.data.split('-').reverse().join('/')}</p>
                    <p><strong>Descrição:</strong> ${sec.descricao || "Nenhuma descrição disponível"}</p>
                </div>
                
                ${sec.equipeFotoUrl ? `
                <div class="team-photo">
                    <img src="${sec.equipeFotoUrl}" alt="Foto da Equipe" />
                    <div class="team-photo-caption">Foto da Equipe</div>
                </div>
                ` : ''}
            </div>
        </div>
            ${sec.informacoes.filter(i => i.descricao.trim() !== "").length > 0 ? `
                <!-- PÁGINA DA TABELA DE INFORMAÇÕES -->
                <div class="page info-table-page">
                    <div class="info-table-header">
                        <h2>Informações da Sub </h2>
                    </div>
                    
                    <table class="info-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sec.informacoes.filter(i => i.descricao.trim() !== "").map((i) => `
                                <tr>
                                    <td>${i.ordem}</td>
                                    <td>${i.descricao}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        </div>
        
        ${sec.servicos.map((servico) => `
            ${servico.fotos.length > 0 ? `
                ${(() => {
                const totalPages = Math.ceil(servico.fotos.length / 3);
                let html = '';

                for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                    const startIndex = pageIndex * 3;
                    const endIndex = startIndex + 3;
                    const pagePhotos = servico.fotos.slice(startIndex, endIndex);
                    const isFirstPage = pageIndex === 0;

                    // Só criar página se houver fotos
                    if (pagePhotos.length > 0) {
                        html += `
                      <!-- PÁGINA FOTOGRÁFICA DO SERVIÇO: ${servico.assunto} - Página ${pageIndex + 1} -->
                      <div class="page service-photo-page">
                        <div class="quantitative-header-line">
                            <div class="prefeitura-logo"></div>
                            <div class="company-logo"></div>
                        </div>

                    ${isFirstPage ? `
                    <div class="photo-descriptors">
                        <div class="descriptor-item">
                            <strong>Subprefeitura:</strong> ${SUB_REGIOES[sec.sub]}
                        </div>
                        <div class="descriptor-item">
                            <strong>Operação São Paulo Limpa:</strong> 
                        </div>
                        <div class="descriptor-item">
                            <strong>Serviço(s):</strong> ${servico.assunto}
                        </div>
                        <div class="descriptor-item">
                            <strong>Data:</strong> ${formatDateForPhotos(sec.data)}
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
            ` : ''}
        `).join('')}
    `).join('')}
    
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

// Função principal para gerar PDF do mutirão usando Puppeteer
export async function exportMutiraoPdf(rel: MutiraoRelatorio): Promise<Uint8Array> {
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

        // Gerar HTML
        const html = generateMutiraoHTML(rel);

        // Carregar HTML na página
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Aguardar um pouco mais para garantir que as imagens carreguem
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Gerar PDF
        const pdf = await page.pdf({
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

        return pdf;

    } finally {
        await browser.close();
    }
}

// Função para gerar HTML do relatório de registro (evidências)
export function generateRegistroHTML(rel: RegistroRelatorio): string {
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
            width: 297mm; /* A4 landscape */
            min-height: 210mm;
            padding: 10mm 60px 10mm 40px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
            page-break-after: always;
        }
        
        /* PÁGINA DE CAPA */
        .cover-page {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding-top: 50mm;
            position: relative;
            overflow: hidden;
        }
        
        .cover-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('${images.cover}') center/cover;
            opacity: 0.3;
            z-index: 1;
        }
        
        .cover-content {
            position: relative;
            z-index: 2;
        }
        
        .logo {
            width: 240px;
            height: 240px;
            margin: 0 auto 30px;
            background: url('${images.logo}') center/contain no-repeat;
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
        
        .cover-subtitle {
            font-size: 24px;
            margin-bottom: 40px;
            opacity: 0.9;
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
            position: relative;
            width: 100%;
            height: 210mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
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
        
        .service-header {
            background: #2c3e50;
            color: white;
            padding: 15px 20px;
        }
        
        .service-header h2 {
            font-size: 24px;
            font-weight: bold;
        }
        
        .service-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        }
        
        .service-info h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .service-info p {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .service-info strong {
            color: #2c3e50;
        }
        
        /* PÁGINA FOTOGRÁFICA */
        .photo-page {
            page-break-before: always;
        }
        
        .photo-header {
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
        }
        
        .photo-header h2 {
            font-size: 20px;
            font-weight: bold;
        }
        
        .photo-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .photo-info p {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .photo-info strong {
            color: #2c3e50;
        }
        
        .photo-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
        
        .photo-item {
            text-align: center;
            border-radius: 8px
        }
        
        .photo-item img {
            max-width: 100%;
            max-height: 750px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .photo-caption {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
            
            .service-page,
            .photo-page {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE<br> EVIDÊNCIAS</h1>
            <div class="cover-date">São Paulo, ${new Date(rel.dataInicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELATÓRIO OPERAÇÃO <br> SÃO PAULO LIMPA</div>
        <div class="service-period">${formatPeriodForServicePage(rel)}</div>
        <div class="service-subregion">${SUB_REGIOES[rel.sub]}</div>
        <div class="service-footer-line"></div>
    </div>
    
    <!-- PÁGINA FOTOGRÁFICA -->
    <div class="page photo-page">
        <div class="photo-header">
            <h2>Registro Fotográfico</h2>
        </div>
        
        <div class="photo-info">
            <p><strong>Assunto:</strong> ${rel.assunto}</p>
            <p><strong>Subprefeitura:</strong> ${SUB_REGIOES[rel.sub as keyof typeof SUB_REGIOES] || rel.sub}</p>
            <p><strong>Data:</strong> ${rel.dataInicio === rel.dataTermino
            ? formatDateForCover(rel.dataInicio)
            : `${formatDateForCover(rel.dataInicio)} a ${formatDateForCover(rel.dataTermino)}`
        }</p>
            <p><strong>Local:</strong> ${rel.local || "-"}</p>
            <p><strong>Total de Fotos:</strong> ${rel.fotos.length}</p>
        </div>
        
        <div class="photo-grid">
            ${rel.fotos.map((foto, fotoIndex) => `
                <div class="photo-item">
                    <img src="${foto.url}" alt="Foto ${fotoIndex + 1}" />
                    ${foto.descricao ? `<div class="photo-caption">${foto.descricao}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
}

// Função para gerar PDF de registro usando Puppeteer
export async function exportRegistroPdf(rel: RegistroRelatorio): Promise<Uint8Array> {
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

        // Gerar HTML
        const html = generateRegistroHTML(rel);

        // Carregar HTML na página
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Aguardar um pouco mais para garantir que as imagens carreguem
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Gerar PDF
        const pdf = await page.pdf({
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

        return pdf;

    } finally {
        await browser.close();
    }
}

// Função para gerar HTML de evidências de mutirões (consolidado por subs)
// Função para obter o nome completo da Subprefeitura
function getSubregionFullName(sub: string): string {
    const subprefeiturasMap: { [key: string]: string } = {
        'CV': 'CASA VERDE / LIMÃO / CACHOEIRINHA',
        'JT': 'JAÇANÃ / TREMEMBÉ',
        'MG': 'VILA MARIA / VILA GUILHERME',
        'ST': 'SANTANA / TUCURUVI'
    };
    return subprefeiturasMap[sub] || sub;
}

// Função para gerar dados da tabela de informações gerais
function generateInfoTableData(mutiroes: MutiraoRelatorio[]): Array<{
    subprefeitura: string;
    endereco: string;
    colaboradores: number;
    veiculos: number;
    bocasLobo: number;
    volumeResiduos: number;
}> {
    // Mapeamento das sub-regiões para subprefeituras
    const subprefeiturasMap: { [key: string]: string } = {
        'CV': 'Casa Verde / Limão / Cachoeirinha',
        'JT': 'Jaçanã / Tremembé',
        'MG': 'Vila Maria / Vila Guilherme',
        'ST': 'Santana / Tucuruvi'
    };

    // Agrupar mutirões por Subprefeitura
    const mutiroesPorSub = mutiroes.reduce((acc: Record<string, MutiraoRelatorio[]>, mutirao: MutiraoRelatorio) => {
        const subRegional = mutirao.secoes[0]?.sub || 'SP';
        if (!acc[subRegional]) {
            acc[subRegional] = [];
        }
        acc[subRegional].push(mutirao);
        return acc;
    }, {});

    // Gerar dados para cada sub-região
    const dados = Object.entries(mutiroesPorSub).map(([sub, mutiroesSub]) => {
        // Pegar o primeiro endereço da sub-região (assumindo que todos são iguais)
        const endereco = mutiroesSub[0]?.secoes[0]?.local || '';

        // Somar quantitativos
        let colaboradores = 0;
        let veiculos = 0;
        let bocasLobo = 0;
        let volumeResiduos = 0;

        mutiroesSub.forEach(mutirao => {
            mutirao.quantitativo.forEach(q => {
                const quantidade = typeof q.quantidade === 'number' ? q.quantidade :
                    (typeof q.quantidade === 'string' && q.quantidade.trim() ?
                        parseFloat(q.quantidade.replace(',', '.')) || 0 : 0);

                const descricao = q.descricao.toLowerCase();
                if (descricao.includes('colaborador')) {
                    colaboradores += quantidade;
                } else if (descricao.includes('equipamento')) {
                    veiculos += quantidade;
                } else if (descricao.includes('boca') || descricao.includes('lobo')) {
                    bocasLobo += quantidade;
                } else if (descricao.includes('volume') || descricao.includes('resíduo') || descricao.includes('residuo')) {
                    volumeResiduos += quantidade;
                }
            });
        });

        return {
            subprefeitura: subprefeiturasMap[sub] || sub,
            endereco,
            colaboradores,
            veiculos,
            bocasLobo,
            volumeResiduos
        };
    });

    // Ordenar por sub-região
    const orderMap: { [key: string]: number } = {
        'CV': 1,
        'JT': 2,
        'MG': 3,
        'ST': 4,
        'SP': 5
    };

    return dados.sort((a, b) => {
        const subA = Object.keys(subprefeiturasMap).find(key => subprefeiturasMap[key] === a.subprefeitura) || 'SP';
        const subB = Object.keys(subprefeiturasMap).find(key => subprefeiturasMap[key] === b.subprefeitura) || 'SP';
        const orderA = orderMap[subA] || 999;
        const orderB = orderMap[subB] || 999;
        return orderA - orderB;
    });
}

// Função para gerar lista de subprefeituras baseada nos dados dos mutirões
function generateSubprefeiturasList(mutiroes: MutiraoRelatorio[]): string {
    // Mapeamento das sub-regiões para subprefeituras
    const subprefeiturasMap: { [key: string]: string[] } = {
        'CV': ['Casa Verde', 'Limão', 'Cachoeirinha'],
        'JT': ['Jaçanã', 'Tremembé'],
        'MG': ['Vila Maria', 'Vila Guilherme'],
        'ST': ['Santana', 'Tucuruvi']
    };

    // Extrair sub-regiões únicas dos mutirões
    const subRegioes = [...new Set(mutiroes.map(m => m.secoes[0]?.sub || 'SP'))];

    // Ordenar alfabeticamente
    const orderMap: { [key: string]: number } = {
        'CV': 1,
        'JT': 2,
        'MG': 3,
        'ST': 4,
        'SP': 5
    };

    subRegioes.sort((a, b) => {
        const orderA = orderMap[a] || 999;
        const orderB = orderMap[b] || 999;
        return orderA - orderB;
    });

    // Gerar lista de subprefeituras
    const subprefeiturasList = subRegioes
        .map(sub => subprefeiturasMap[sub] || [sub])
        .map(subprefeituras => subprefeituras.join(' / '))
        .join(' | ');

    return `Subprefeituras: ${subprefeiturasList}`;
}

export function generateEvidenciasMutiroesHTML(mutiroes: MutiraoRelatorio[], data: string): string {
    const images = getImageUrls();

    // Ordenar mutirões alfabeticamente por sub-região antes de agrupar
    const mutiroesOrdenados = mutiroes.sort((a, b) => {
        const subA = a.secoes[0]?.sub || 'SP';
        const subB = b.secoes[0]?.sub || 'SP';

        // Ordenação alfabética: CV, JT, MG, ST
        const orderMap: { [key: string]: number } = {
            'CV': 1,
            'JT': 2,
            'MG': 3,
            'ST': 4,
            'SP': 5 // fallback para outras sub-regiões
        };

        const orderA = orderMap[subA] || 999;
        const orderB = orderMap[subB] || 999;

        return orderA - orderB;
    });

    // Agrupar mutirões por sub-região (já ordenados)
    const mutiroesPorSub = mutiroesOrdenados.reduce((acc: Record<string, MutiraoRelatorio[]>, mutirao: MutiraoRelatorio) => {
        const subRegional = mutirao.secoes[0]?.sub || 'SP';
        if (!acc[subRegional]) {
            acc[subRegional] = [];
        }
        acc[subRegional].push(mutirao);
        return acc;
    }, {});

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Evidências - Mutirões</title>
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
            width: 297mm; /* A4 landscape */
            min-height: 210mm;
            margin: 0 auto;
            background: white;
            position: relative;
        }
        
        .page.cover-page,
        .page.service-page,
        .page.quantitative-page,
        .page.subregion-page {
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* PÁGINA DE CAPA */
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
        
        .cover-logo {
            position: absolute;
            top: -90px;
            right: 80px;
            width: 330px;
            height: 330px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 3;
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
            position: relative;
            width: 100%;
            height: 210mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
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
        
        /* PÁGINA DE QUANTITATIVO */
              .quantitative-page {
            min-height: 210mm;
            padding: 20mm;
        }
        
        .quantitative-header-line{
            display: flex;
            position: relative;
            justify-content: space-between;
            align-items: space-between;
            width: 100%;
            height: 50px;
            z-index: 10;
        }
        .quantitative-header {
            background: #304057;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
            text-align: center;
        }
        .quantitative-header-total {
            background: #00255f;
            color: white;
            padding: 15px 20px;
            margin: 0 0 5px 0;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        
        .subprefeituras-list {
            color: #2c3e50;
            padding: 5px 20px;
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
        }
        
        /* PÁGINA DE INFORMAÇÕES GERAIS */
        .info-page {
            min-height: 210mm;
            padding: 25mm 60px 10mm 40px;
            position: relative;
        }
        
        .info-header-line {
            display: flex;
            position: relative;
            justify-content: space-between;
            align-items: space-between;
            width: 100%;
            height: 40px;
            z-index: 10;
            margin-bottom: 20px;
        }
        
        .info-header-line .prefeitura-logo {
            position: absolute;
            left: 20px;
            top: 0px;
            transform: translateY(-50%);
            width: 120px;
            height: 120px;
            background: url('${images.prefeitura}') center/contain no-repeat;
        }
        
        .info-header-line .company-logo {
            position: absolute;
            right: 20px;
            top: 0px;
            transform: translateY(-50%);
            width: 120px;
            height: 100px;
            background: url('${images.logo}') center/contain no-repeat;
        }
        
        .info-header {
            color: #29571b;
            position: relative;
            display: flex;
            align-items: left;
            justify-content: center;
        }
        
        .info-header h2 {
            font-size: 24px;
            font-weight: bold;
            flex-grow: 1;
            text-align: left;
        }
        
        .info-date {
            color: black;
            background: #f8f9fa;
            padding: 0px;
            margin-top: 10px;
            font-size: 16px;
            font-weight: 600;
            text-align: left;
            border-radius: 8px;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .info-table th,
        .info-table td {
            border: 1px solid #f8a562;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        .info-table th {
            background: #dce6f2;
            font-weight: bold;
            color: #2c3e50;
            font-size: 16px;
            text-align: center;
        }
        
        .info-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .info-table td:nth-child(3),
        .info-table td:nth-child(4),
        .info-table td:nth-child(5),
        .info-table td:nth-child(6) {
            text-align: center;
        }
        
        .info-footer-image {
            position: absolute;
            bottom: -10px;
            left: 70px;
            width: 120px;
            height: 120px;
            background: url('${images.info156}') center/contain no-repeat;
        }
        

        .quantitative-header h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            top: 300px;
            flex-grow: 1;
            text-align: center;
        }
        

        .quantitative-header-line .prefeitura-logo {
            position: absolute;
            left: 20px;
            top: 0px;
            transform: translateY(-50%);
            width: 120px;
            height: 120px;
            background: url('${images.prefeitura}') center/contain no-repeat;
        }
        
        .quantitative-header-line .company-logo {
            position: absolute;
            right: 20px;
            top: 0px;
            transform: translateY(-50%);
            width: 120px;
            height: 100px;
            background: url('${images.logo}') center/contain no-repeat;
        }
        
        .quantitative-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 16px;
            border-radius: 0 0 8px 8px;
        }
        
        .quantitative-table th,
        .quantitative-table td {
            border: 1px solid #ddd;
            padding: 5px;
            padding-left: 20px;
            text-align: left;
        }
        
        .quantitative-table th {
            background: #dce6f2;
            font-weight: bold;
            color: #2c3e50;
            font-size: 18px;
            line-height: 2.5;
            text-align: center;

        }
        
        .quantitative-table tr:nth-child(even) {
            background: #dce6f2;
        }
        
        .quantitative-table td:nth-child(2) {
            text-align: center;
        }
        
        /* PÁGINA DE Subprefeitura */
        .subregion-page {
            padding: 20mm 60px 10mm 40px;
        }
     .subregion-cover-title {
            font-size: 26px;
            color: rgb(0, 48, 107);
            margin-bottom: 10px;
            font-weight: bold;
     }

    .subregion-cover-date {
            font-size: 24px;
            color: rgb(0, 48, 107);
            margin-bottom: 10px;
            font-weight: bold;
        
    }
        /* PÁGINA DE DESCRIÇÃO DOS ITENS */
        .items-description-page {
            padding: 20mm 60px 10mm 40px;
        }
        
        .subregion-name{
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .items-description-header {
            background: #34495e;
            color: white;
            padding: 15px 20px;
            text-align: center;
        }
        
        .items-description-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            border-radius: 8px;
            margin-top: 15px;
        }
        
        .items-description-table th,
        .items-description-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        /* Centralizar apenas a coluna "Item" (primeira coluna) */
        .items-description-table th:first-child,
        .items-description-table td:first-child {
            text-align: center;
        }
        
        .items-description-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .items-description-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .subregion-header {
            background: #3498db;
            color: white;
            padding: 15px 20px;
            margin: 0 0 10px 0;
        }
        
        .subregion-header h2 {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
        
        .subregion-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }
        
        .subregion-info {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
        }
        
        .subregion-info h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .subregion-info p {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .team-photo {
            text-align: center;
        }
        
        .team-photo img {
            max-width: 500px;
            max-height: 500px;
            width: auto;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            object-fit: contain;
        }
        
        .team-photo-caption {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            font-style: italic;
        }
        
        /* PÁGINA DA TABELA DE INFORMAÇÕES */
        .info-table-page {
            padding: 10mm 60px 10mm 40px;
            min-height: 210mm;
        }
        
        .info-table-header {
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: 0px 60px 0px 30px;
        }
        
        .info-table-header h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
        }
        
        /* TABELA DE INFORMAÇÕES */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
        }
        
        .info-table th,
        .info-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            word-wrap: break-word;
        }
        
        .info-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .info-table tr {
            /* Quebra de linha natural */
        }
        
        .info-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* PÁGINA DE SERVIÇO FOTOGRÁFICO */
        .service-photo-page {
            padding: 20mm 60px 10mm 40px;
            position: relative;
        }
        
        .service-photo-header {
            background: rgb(0, 48, 107);
            color: white;
            padding: 20px;
            margin: -20mm -20mm 30px -20mm;
            text-align: center;
        }
        
        .service-photo-header h2 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .service-photo-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid rgb(0, 48, 107);
        }
        
        .service-photo-info p {
            margin-bottom: 10px;
            font-size: 14px;
            color: #333;
        }
        
        .service-photo-info strong {
            color: rgb(0, 48, 107);
            font-weight: bold;
        }
        
        .photo-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-top: 20px;
        }
        
        .photo-item {
            text-align: center;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 2px 10px 0 rgba(44, 62, 80, 0.10), 0 1.5px 4px 0 rgba(52, 152, 219, 0.08);
            border: 1.5px solid #e0e6ed;
            padding: 4px 2px 8px 2px;
            margin-bottom: 4px;
            transition: box-shadow 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    
        
        .photo-item img {
            max-width: 100%;
            max-height: 750px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 15px;

        }
        
        .photo-caption {
            margin-top: 5px;
            font-size: 14px;
            color: rgb(0, 48, 107);
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* GRID DE FOTOS DINÂMICO PARA MUTIRÃO CONSOLIDADO - REFATORADO */
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
            min-height: 380px;
            max-height: 430px;
        }
        
        .photos-grid.two-photos .photo-container {
            min-height: 380px;
            max-height: 430px;
        }
        
        .photos-grid.three-photos .photo-container {
            min-height: 380px;
            max-height: 430px;
        }
        
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        
        .photo-description {
            font-size: 12px;
            color: #2c3e50;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 5px;
            text-align: center;
            line-height: 1.2;
        }
        
        /* CABEÇALHO DA PÁGINA FOTOGRÁFICA PARA MUTIRÃO */
        .photo-page-header {
            position: relative;
            background: #34495e;
            color: white;
            padding: 15px 20px;
            margin: 0px 60px 0px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
        
        /* DESCRITORES PARA MUTIRÃO */
        .photo-descriptors {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 10px;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .descriptor-item {
            margin-bottom: 8px;
            color: #2c3e50;
            line-height: 0.8;
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
            padding: 20px 60px 0px 40px;
            margin: -20mm -60px 0px -40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 60px;
        }
        
        
        .prefeitura-logo {
            width: 120px;
            height: 120px;
            background: url('${images.prefeitura}') center/contain no-repeat;
            margin-right: 30px;
        }
        
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${images.logo}') center/contain no-repeat;
            margin-left: 30px;
        }
        
        /* PÁGINA FINAL */
        .final-page {
            position: relative;
            width: 100%;
            height: 210mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
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
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
            transform: scaleY(-1);
            z-index: 10;
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
            
            /* Configurações específicas para quebra de página */
            .page.cover-page,
            .page.service-page,
            .page.quantitative-page {
                page-break-after: always;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            /* Evitar quebras dentro de elementos importantes */
            .photo-header-with-logos,
            .photo-descriptors,
            .info-table-header {
                page-break-after: avoid;
                break-after: avoid;
            }
            
            /* Controle específico para seção fotográfica */
            .service-photo-page {
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
            
            .info-table {
                page-break-inside: auto;
            }
            
            .info-table tr {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE<br> EVIDÊNCIAS</h1>
            <div class="cover-date">São Paulo, ${new Date(data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELATÓRIO OPERAÇÃO <br> SÃO PAULO LIMPA</div>
        <div class="service-period">${formatDateForCover(data)}</div>
        <div class="service-subregion">EVIDÊNCIAS CONSOLIDADAS</div>
        <div class="service-footer-line"></div>
    </div>
    
    <!-- PÁGINA DE INFORMAÇÕES GERAIS -->
    <div class="page info-page">
        <div class="info-header-line">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
        <div class="info-header">
            <h2>Informações Gerais</h2>
        </div>
        
        <div class="info-date">
            Data: ${(() => {
            const d = new Date(data);
            d.setDate(d.getDate() + 1);
            return d.toLocaleDateString('pt-BR');
        })()}
        </div>
        
        <table class="info-table">
            <thead>
                <tr>
                    <th colspan="6" style="text-align: center;">Quantitativo do Mutirão - Operação São Paulo Limpa</th>
                </tr>
                <tr>
                    <th style="text-align: center;">Subprefeitura</th>
                    <th style="text-align: center;">Endereço</th>
                    <th style="text-align: center;">Colaboradores</th>
                    <th style="text-align: center;">Qnt. veículos</th>
                    <th style="text-align: center;">Bocas de lobo limpas</th>
                    <th style="text-align: center;">Volume de resíduos coletados (Ton.)</th>
                </tr>
            </thead>
            <tbody>
                ${(() => {
            const dados = generateInfoTableData(mutiroes);
            return dados.map(dado => `
                    <tr>
                        <td>${dado.subprefeitura}</td>
                        <td>${dado.endereco}</td>
                        <td>${dado.colaboradores}</td>
                        <td>${dado.veiculos}</td>
                        <td>${dado.bocasLobo}</td>
                        <td>${dado.volumeResiduos}</td>
                    </tr>
                  `).join('');
        })()}
            </tbody>
        </table>
        
        <div class="info-footer-image"></div>
    </div>
    
    <!-- PÁGINA DE QUANTITATIVO -->
    <div class="page quantitative-page">

        <div class="quantitative-header-line">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
        <div class="subprefeituras-list">
            ${generateSubprefeiturasList(mutiroes)}
        </div>
        <div class="quantitative-header-total">
            <h2>QUANTITATIVO TOTAL</h2>
        </div>
        
        <table class="quantitative-table">
            <thead>
                <tr>
                    <th>Descrição do Serviço</th>
                    <th>Quantidade</th>
                </tr>
            </thead>
            <tbody>
                ${(() => {
            // Agregar quantitativos de todos os mutirões
            const quantitativosAgregados: Record<string, number> = {};

            mutiroes.forEach(mutirao => {
                mutirao.quantitativo.forEach(q => {
                    const descricao = q.descricao;
                    const quantidade = typeof q.quantidade === 'number' ? q.quantidade :
                        (typeof q.quantidade === 'string' && q.quantidade.trim() ?
                            parseFloat(q.quantidade.replace(',', '.')) || 0 : 0);

                    if (!quantitativosAgregados[descricao]) {
                        quantitativosAgregados[descricao] = 0;
                    }
                    quantitativosAgregados[descricao] += quantidade;
                });
            });

            return Object.entries(quantitativosAgregados).map(([descricao, quantidade]) => `
                    <tr>
                        <td>${descricao}</td>
                        <td>${quantidade % 1 === 0 ? quantidade.toString() : quantidade.toFixed(1).replace('.', ',')}</td>
                    </tr>
                  `).join('');
        })()}
            </tbody>
        </table>
    </div>
    
    ${Object.entries(mutiroesPorSub).map(([subRegional, mutiroesSub]) => {
            const mutiroesArray = mutiroesSub as MutiraoRelatorio[];
            const subregionFullName = getSubregionFullName(subRegional);

            return `

    <!-- CAPA DA Subprefeitura: ${subRegional} -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELATÓRIO OPERAÇÃO <br> SÃO PAULO LIMPA</div>
        <div class="subregion-cover-title">${subregionFullName}</div>
        <div class="subregion-cover-date">${formatDateForCover(data)}</div>
        <div class="service-footer-line"></div>

    </div>

        
        ${mutiroesArray.map((mutirao, mutiraoIndex) => `
            ${mutirao.secoes.map((sec, idx) => `
                ${sec.mapaFotoUrl ? `
                    <!-- PÁGINA DO MAPA DA Subprefeitura: ${subRegional} -->
                    <div class="page subregion-page">
                        <div class="photo-header-with-logos">
                            <div class="prefeitura-logo"></div>
                            <div class="company-logo"></div>
                        </div>
                        <div class="subregion-content">
                            <div class="subregion-info">
                                <h3>Operação São Paulo Limpa</h3>
                                <p><strong>Subprefeitura / Regional:</strong> ${subregionFullName}</p>
                                <p><strong>Serviço:</strong> Mutirão</p>
                                <p><strong>Local:</strong> ${sec.local ?? "-"}</p>
                                <p><strong>Data:</strong> ${sec.data.split('-').reverse().join('/')}</p>
                                <p><strong>Descrição:</strong> ${sec.descricao || "Nenhuma descrição disponível"}</p>
                            </div>
                            
                            <div class="team-photo">
                                <img src="${sec.mapaFotoUrl}" alt="Mapa da Operação" />
                                <div class="team-photo-caption">Mapa da Operação</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${sec.equipeFotoUrl ? `
                    <!-- PÁGINA DA FOTO DA EQUIPE: ${subRegional} -->
                    <div class="page subregion-page">
                        <div class="photo-header-with-logos">
                            <div class="prefeitura-logo"></div>
                            <div class="company-logo"></div>
                        </div>
                        <div class="subregion-content">
                            <div class="subregion-info">
                                <h3>Operação São Paulo Limpa</h3>
                                <p><strong>Subprefeitura / Regional:</strong> ${subregionFullName}</p>
                                <p><strong>Serviço:</strong> Mutirão</p>
                                <p><strong>Local:</strong> ${sec.local ?? "-"}</p>
                                <p><strong>Data:</strong> ${sec.data.split('-').reverse().join('/')}</p>
                                <p><strong>Descrição:</strong> ${sec.descricao || "Nenhuma descrição disponível"}</p>
                            </div>
                            
                            <div class="team-photo">
                                <img src="${sec.equipeFotoUrl}" alt="Foto da Equipe" />
                                <div class="team-photo-caption">Foto da Equipe</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${sec.informacoes.filter(i => i.descricao.trim() !== "").length > 0 ? `
                    <!-- PÁGINA DA TABELA DE INFORMAÇÕES: ${subRegional} -->
                    <div class="page items-description-page">
                    <div class="subregion-name">
                        <h3 class="subregion-name-title">Subprefeitura: ${subregionFullName}</h3> 
                    </div>
                        <div class="items-description-header">
                            <h2>INFORMAÇÕES</h2>
                        </div>
                        
                        <table class="items-description-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sec.informacoes.filter(i => i.descricao.trim() !== "").map((i) => `
                                    <tr>
                                        <td>${i.ordem}</td>
                                        <td>${i.descricao}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            `).join('')}
        `).join('')}
        
        <!-- PÁGINA DE QUANTITATIVO DA Subprefeitura -->
        <div class="page quantitative-page">
            <div class="quantitative-header-line">
                <div class="prefeitura-logo"></div>
                <div class="company-logo"></div>
            </div>
            <div class="quantitative-header">
                <h2>Quantitativo da Subprefeitura</h2>
                <p>${subregionFullName}</p>
            </div>
            
            <table class="quantitative-table">
                <thead>
                    <tr>
                        <th>Descrição do Serviço</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    ${(() => {
                    // Agregar quantitativos dos mutirões desta sub-região
                    const quantitativosSub: Record<string, number> = {};

                    mutiroesArray.forEach(mutirao => {
                        mutirao.quantitativo.forEach(q => {
                            const descricao = q.descricao;
                            const quantidade = typeof q.quantidade === 'number' ? q.quantidade :
                                (typeof q.quantidade === 'string' && q.quantidade.trim() ?
                                    parseFloat(q.quantidade.replace(',', '.')) || 0 : 0);

                            if (!quantitativosSub[descricao]) {
                                quantitativosSub[descricao] = 0;
                            }
                            quantitativosSub[descricao] += quantidade;
                        });
                    });

                    return Object.entries(quantitativosSub).map(([descricao, quantidade]) => `
                        <tr>
                            <td>${descricao}</td>
                            <td>${quantidade % 1 === 0 ? quantidade.toString() : quantidade.toFixed(1).replace('.', ',')}</td>
                        </tr>
                      `).join('');
                })()}
                </tbody>
            </table>
        </div>
        
        ${mutiroesArray.map((mutirao, mutiraoIndex) => `
            ${mutirao.secoes.map((sec, idx) => `
                
                ${sec.servicos.map((servico) => `
                    ${servico.fotos.length > 0 ? `
                        ${(() => {
                            const totalPages = Math.ceil(servico.fotos.length / 3);
                            let html = '';

                            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                                const startIndex = pageIndex * 3;
                                const endIndex = startIndex + 3;
                                const pagePhotos = servico.fotos.slice(startIndex, endIndex);
                                const isFirstPage = pageIndex === 0;

                                // Só criar página se houver fotos
                                if (pagePhotos.length > 0) {
                                    html += `
                              <!-- PÁGINA FOTOGRÁFICA DO SERVIÇO: ${servico.assunto} - Página ${pageIndex + 1} -->
                              <div class="page service-photo-page">
                                  <div class="photo-header-with-logos">
                                      <div class="prefeitura-logo"></div>
                                      <h2> ${servico.fotos.length > 3 ? `- Página ${pageIndex + 1}` : ''}</h2>
                                      <div class="company-logo"></div>
                                  </div>
                                  
                                  ${isFirstPage ? `
                                  <div class="photo-descriptors">
                                      <div class="descriptor-item">
                                          <strong>PREFEITURA REGIONAL:</strong> ${subregionFullName}
                                      </div>
                                      <div class="descriptor-item">
                                          <strong>Operação São Paulo Limpa</strong>
                                      </div>
                                      <div class="descriptor-item">
                                          <strong>Serviço(s):</strong> ${servico.assunto}
                                      </div>
                                      <div class="descriptor-item">
                                          <strong>Data:</strong> ${formatDateForPhotos(sec.data)}
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
                    ` : ''}
                `).join('')}
            `).join('')}
        `).join('')}
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

// Função para gerar PDF de evidências de mutirões
export async function exportEvidenciasMutiroesPdf(mutiroes: MutiraoRelatorio[], data: string): Promise<Uint8Array> {
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

        // Gerar HTML
        const html = generateEvidenciasMutiroesHTML(mutiroes, data);

        // Carregar HTML na página
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Aguardar um pouco mais para garantir que as imagens carreguem
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Gerar PDF
        const pdf = await page.pdf({
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

        return pdf;

    } finally {
        await browser.close();
    }
}
