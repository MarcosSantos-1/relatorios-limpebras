import { MonumentosRelatorio } from "../types";
import { formatDateForCover, formatDateForPhotos } from "../utils";
import { getImageUrls } from "./image-loader";

export function generateMonumentosHTML(rel: MonumentosRelatorio): string {
  const images = getImageUrls();
  const dataFormatada = formatDateForCover(rel.data);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Monumentos - ${rel.monumento}</title>
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
            padding-right: 120px;
            color: white;
        }
        
        .cover-title {
            font-family: 'Anton', sans-serif;
            font-size: 42px;
            font-weight: 400;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .cover-subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            font-weight: 300;
            opacity: 0.9;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        .cover-info {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            margin-left: auto;
        }
        
        .cover-info h3 {
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: bold;
            text-align: center;
        }
        
        .cover-info p {
            margin: 5px 0;
            font-size: 14px;
            text-align: left;
        }
        
        .cover-date {
            margin-top: 30px;
            font-size: 16px;
            opacity: 0.8;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        /* CONTRA CAPA */
        .service-page {
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }
        
        .service-content {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
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
        
        /* GRID DE FOTOS DINÂMICO PARA MONUMENTOS - REFATORADO */
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
            height: 4px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
        }
        
        .final-bottom-line {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: url('${images.line}') no-repeat;
            background-size: 100% 100%;
        }
    </style>
</head>
<body>
    <!-- CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">Relatório de Monumentos</h1>
            <h2 class="cover-subtitle">Limpeza e Conservação de Monumentos Públicos</h2>
            
            <div class="cover-info">
                <h3>Informações do Serviço</h3>
                <p><strong>Monumento:</strong> ${rel.monumento}</p>
                <p><strong>Local:</strong> ${rel.local}</p>
                <p><strong>Setor:</strong> ${rel.setorSelecionado}</p>
                <p><strong>Sub-região:</strong> ${getSubRegiaoName(rel.sub)}</p>
            </div>
            
            <div class="cover-date">
                ${dataFormatada}
            </div>
        </div>
    </div>
    
    <!-- CONTRA CAPA -->
    <div class="page service-page">
        <div class="service-content">
            <h1 class="service-title">Detalhes do Serviço</h1>
            
            <div class="service-period">
                <strong>Data:</strong> ${formatDateForPhotos(rel.data)}
            </div>
            
            <div class="service-subregion">
                <strong>Sub-região:</strong> ${getSubRegiaoName(rel.sub)}
            </div>
            
            <div style="font-size: 18px; color: #2c3e50; line-height: 1.6;">
                <p><strong>Assunto:</strong> ${rel.assunto}</p>
                <p><strong>Setor:</strong> ${rel.setorSelecionado}</p>
                <p><strong>Monumento:</strong> ${rel.monumento}</p>
                <p><strong>Local Atendido:</strong> ${rel.local}</p>
                ${rel.descricao ? `<p><strong>Descrição:</strong> ${rel.descricao}</p>` : ''}
            </div>
        </div>
        <div class="service-footer-line"></div>
    </div>
    
    ${rel.fotos.length > 0 ? `
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
        
        html += `
        <!-- SEÇÃO FOTOGRÁFICA - ${rel.monumento} -->
        <div class="page content-page">
            <div class="largura-fotografico">
                <div class="photo-header-with-logos">
                    <div class="prefeitura-logo"></div>
                    <h2>Relatório Fotográfico</h2>
                    <div class="company-logo"></div>
                </div>
                
                <div class="photo-descriptors">
                    <div class="descriptor-item">
                        <strong>PREFEITURA REGIONAL:</strong> ${getSubRegiaoName(rel.sub)}
                    </div>
                    <div class="descriptor-item">
                        <strong>Serviço(s):</strong> Limpeza e Conservação de Monumentos Públicos
                    </div>
                    <div class="descriptor-item">
                        <strong>Local / Evento:</strong> ${rel.local}
                    </div>
                    <div class="descriptor-item">
                        <strong>Monumento:</strong> ${rel.monumento}
                    </div>
                    <div class="descriptor-item">
                        <strong>Setor:</strong> ${rel.setorSelecionado}
                    </div>
                    <div class="descriptor-item">
                        <strong>Período/ Data:</strong> ${new Date(rel.data).toLocaleDateString('pt-BR')}
                    </div>
                </div>
                
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

function getSubRegiaoName(sub: string): string {
  const subRegioes: Record<string, string> = {
    'CV': 'Casa Verde / Limão / Cachoeirinha',
    'JT': 'Jaçanã / Tremembé',
    'MG': 'Vila Maria / Vila Guilherme',
    'ST': 'Santana / Tucuruvi',
    'SP': 'São Paulo'
  };
  return subRegioes[sub] || sub;
}