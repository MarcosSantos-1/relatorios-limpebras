/**
 * ========================================
 * GERADOR DE PDF PARA SERVIÇOS ROTINEIROS - SELIMP
 * ========================================
 * 
 * Este arquivo contém toda a lógica para gerar PDFs de serviços rotineiros.
 * 
 * ESTRUTURA DO PDF:
 * 1. Capa (título "Relatório de Serviços Rotineiros", data, sub-região)
 * 2. Contracapa (título "Relatório de Serviços Rotineiros")
 * 3. Páginas fotográficas por serviço (sem tabelas, apenas fotos)
 * 4. Capa final
 * 
 * FUNÇÕES PRINCIPAIS:
 * - exportEvidenciasRotineirosPdf(): PDF consolidado de múltiplas sub-regiões
 * 
 * PERSONALIZAÇÃO CSS:
 * - Todos os estilos estão inline para facilitar edição
 * - Use @page para configurações de página
 * - Classes principais: .page, .cover-page, .service-photo-page
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

import type { RotineirosRelatorio } from "@/lib/types";
import { SUB_REGIOES } from "@/lib/types";
import { formatDateForCover, formatDateForPhotos } from "@/lib/utils";
import { getImageUrls } from "./image-loader";

/**
 * ========================================
 * GERAÇÃO DE HTML PARA SERVIÇOS ROTINEIROS
 * ========================================
 */
export function generateRotineirosHTML(mesAno: string, rotineiros: RotineirosRelatorio[]): string {
    const images = getImageUrls();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Serviços Rotineiros</title>
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
        .page.service-photo-page {
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
        
        /* DESCRITORES PARA SERVIÇOS ROTINEIROS */
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
        
        /* GRID DE FOTOS DINÂMICO */
        .photos-grid {
            display: grid;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
            align-items: start;
        }
        
        .photos-grid.one-photo {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 20px auto 0;
        }
        
        .photos-grid.two-photos {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .photos-grid.three-photos {
            grid-template-columns: repeat(3, 1fr);
        }
        
        .photo-item {
            text-align: center;
            border-radius: 12px;
            transition: transform 0.2s ease;
        }
        
        .photo-container {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        /* Alturas dinâmicas baseadas no número de fotos - OTIMIZADAS PARA A4 LANDSCAPE */
        .photos-grid.one-photo .photo-container {
            height: 400px;
        }
        
        .photos-grid.two-photos .photo-container {
            height: 400px;
        }
        
        .photos-grid.three-photos .photo-container {
            height: 400px;
        }
        
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        
        .photo-description {
            font-size: 10px;
            color: black;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
        
        /* HEADER COM LOGOS */
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
    </style>
</head>
<body>
    <!-- CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE <br>EVIDÊNCIAS</h1>
            <div class="cover-date">São Paulo, ${mesAno}</div>
        </div>
    </div>
    
    ${(() => {
        // Ordenar sub-regiões em ordem específica: CV, JT, MG, ST
        const subregioesOrdenadas = ['CV', 'JT', 'MG', 'ST'];
        
        return subregioesOrdenadas.map(sub => {
            // Buscar todos os registros desta sub-região
            const registrosSubregiao = rotineiros.filter(r => r.sub === sub);
            
            if (registrosSubregiao.length === 0) return '';
            
            // Ordenar registros por data (mais antigo primeiro)
            const registrosOrdenados = registrosSubregiao.sort((a, b) => 
                new Date(a.data).getTime() - new Date(b.data).getTime()
            );
            
            return `
                <!-- CONTRACAPA DA SUB-REGIÃO ${SUB_REGIOES[sub as keyof typeof SUB_REGIOES]} -->
                <div class="page service-page">
                    <div class="service-logo"></div>
                    <div class="service-title">RELATÓRIO DE <br>SERVIÇOS ROTINEIROS</div>
                    <div class="service-period">${mesAno}</div>
                    <div class="service-subregion">${SUB_REGIOES[sub as keyof typeof SUB_REGIOES]}</div>
                    <div class="service-footer-line"></div>
                </div>
                
                <!-- SERVIÇOS DA SUB-REGIÃO ${SUB_REGIOES[sub as keyof typeof SUB_REGIOES]} -->
                ${registrosOrdenados.map(rotineiro => 
                    rotineiro.servicos.map((servico, servicoIndex) => {
                        // Dividir fotos em páginas de 3 fotos cada
                        const photosPerPage = 3;
                        const totalPages = Math.ceil(servico.fotos.length / photosPerPage);
                        
                        return Array.from({ length: totalPages }, (_, pageIndex) => {
                            const startIndex = pageIndex * photosPerPage;
                            const endIndex = startIndex + photosPerPage;
                            const pagePhotos = servico.fotos.slice(startIndex, endIndex);
                            const isFirstPage = pageIndex === 0;

                            // Só criar página se houver fotos
                            if (pagePhotos.length > 0) {
                                return `
                                  <!-- PÁGINA FOTOGRÁFICA DO SERVIÇO: ${servico.assunto} - Página ${pageIndex + 1} -->
                                  <div class="page service-photo-page">
                                    <div class="quantitative-header-line">
                                        <div class="prefeitura-logo"></div>
                                        <div class="company-logo"></div>
                                    </div>

                                ${isFirstPage ? `
                                <div class="photo-descriptors">
                                    <div class="descriptor-item">
                                        <strong>Subprefeitura:</strong> ${SUB_REGIOES[rotineiro.sub]}
                                    </div>
                                    <div class="descriptor-item">
                                        <strong>Serviços Rotineiros</strong> 
                                    </div>
                                    <div class="descriptor-item">
                                        <strong>Serviço(s):</strong> ${servico.assunto}
                                    </div>
                                    <div class="descriptor-item">
                                        <strong>Data:</strong> ${formatDateForPhotos(rotineiro.data)}
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
                            return '';
                        }).join('');
                    }).join('')
                ).join('')}
            `;
        }).join('');
    })()}
    
    <!-- PÁGINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>`;
}

/**
 * ========================================
 * EXPORTAÇÃO DE PDF PARA SERVIÇOS ROTINEIROS
 * ========================================
 */
export async function exportEvidenciasRotineirosPdf(mesAno: string, rotineiros: RotineirosRelatorio[]): Promise<Buffer> {
    console.log(`🚀 Iniciando geração de PDF para ${rotineiros.length} serviço(s) rotineiro(s)`);
    console.log('📅 Mês/Ano:', mesAno);
    console.log('📊 Dados dos rotineiros:', rotineiros);
    
    // Validar dados antes de gerar HTML
    const totalServicos = rotineiros.reduce((total, rotineiro) => total + rotineiro.servicos.length, 0);
    const totalFotos = rotineiros.reduce((total, rotineiro) => 
        total + rotineiro.servicos.reduce((servicoTotal, servico) => 
            servicoTotal + servico.fotos.length, 0), 0);
    
    console.log(`📊 Total de serviços: ${totalServicos}, Total de fotos: ${totalFotos}`);
    
    if (totalServicos === 0) {
        throw new Error('Nenhum serviço encontrado para gerar o PDF');
    }
    
    const html = generateRotineirosHTML(mesAno, rotineiros);
    console.log('📄 HTML gerado:', html.substring(0, 500) + '...');
    
    // Usar puppeteer completo em desenvolvimento, puppeteer-core em produção
    const puppeteerInstance = process.env.NODE_ENV === 'production' ? puppeteer : puppeteerDev;
    
    if (!puppeteerInstance) {
        throw new Error('Puppeteer não disponível');
    }
    
    console.log('🔧 Usando puppeteer:', process.env.NODE_ENV === 'production' ? 'puppeteer-core' : 'puppeteer');
    
    const config = await getPuppeteerConfig();
    console.log('⚙️ Configuração do puppeteer:', config);
    
    const browser = await puppeteerInstance.launch(config);
    console.log('🚀 Browser lançado com sucesso');
    
    try {
        const page = await browser.newPage();
        console.log('📄 Página criada com sucesso');
        
        // Configurar timeout da página
        page.setDefaultTimeout(30000); // 30 segundos
        page.setDefaultNavigationTimeout(30000); // 30 segundos
        
        // Configurar viewport para A4 landscape
        await page.setViewport({
            width: 1123, // A4 landscape width in pixels at 96 DPI
            height: 794, // A4 landscape height in pixels at 96 DPI
            deviceScaleFactor: 1
        });
        console.log('🖥️ Viewport configurado');
        
        // Carregar HTML com estratégia mais robusta
        console.log('📄 Carregando HTML na página...');
        
        try {
            // Primeiro, carregar HTML sem aguardar todas as imagens
            await page.setContent(html, { 
                waitUntil: 'domcontentloaded', // Mais rápido que networkidle0
                timeout: 60000 // 1 minuto para carregar HTML
            });
            console.log('📄 HTML carregado na página');
            
            // Aguardar carregamento de imagens de forma mais inteligente
            console.log('⏳ Aguardando carregamento das imagens...');
            
            let tentativas = 0;
            const maxTentativas = 30; // 30 tentativas de 10 segundos = 5 minutos máximo
            
            while (tentativas < maxTentativas) {
                const imagesLoaded = await page.evaluate(() => {
                    const images = document.querySelectorAll('img');
                    const totalImages = images.length;
                    let loadedImages = 0;
                    
                    for (const img of images) {
                        if (img.complete && img.naturalHeight !== 0) {
                            loadedImages++;
                        }
                    }
                    
                    return {
                        total: totalImages,
                        loaded: loadedImages,
                        allLoaded: loadedImages === totalImages && totalImages > 0
                    };
                });
                
                console.log(`📊 Imagens: ${imagesLoaded.loaded}/${imagesLoaded.total} carregadas`);
                
                if (imagesLoaded.allLoaded || imagesLoaded.total === 0) {
                    console.log('✅ Todas as imagens carregadas!');
                    break;
                }
                
                // Aguardar 10 segundos antes da próxima verificação
                await new Promise(resolve => setTimeout(resolve, 10000));
                tentativas++;
            }
            
            if (tentativas >= maxTentativas) {
                console.warn('⚠️ Timeout no carregamento de imagens, mas continuando com o PDF...');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar HTML:', error);
            throw error;
        }
        
        // Verificar se a página ainda está conectada
        if (page.isClosed()) {
            throw new Error('Página foi fechada antes da geração do PDF');
        }
        
        // Gerar PDF
        console.log('🔄 Iniciando geração do PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0'
            },
            preferCSSPageSize: true,
            timeout: 1200000 // 20 minutos de timeout para geração de PDFs muito grandes
        });
        
        console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBuffer.length} bytes`);
        
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Erro durante a geração do PDF:', error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        
        // Tratamento específico para erro de target fechado
        if (error instanceof Error && error.message.includes('Target closed')) {
            console.error('🔍 Browser foi fechado prematuramente. Tentando novamente...');
            throw new Error('Browser foi fechado durante a geração do PDF. Tente novamente.');
        }
        
        throw error;
    } finally {
        await browser.close();
        console.log('🔒 Browser fechado');
    }
}