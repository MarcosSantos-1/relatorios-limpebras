const pdf = require('html-pdf-node');
const path = require('path');
const fs = require('fs');

// Configuração do html-pdf-node
const getPdfConfig = () => {
  return {
    format: 'A4',
    landscape: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: true
  };
};

// URLs das imagens (ajustar conforme necessário)
const getImageUrls = () => ({
  cover: 'https://via.placeholder.com/1200x800/00306b/ffffff?text=Capa',
  logo: 'https://via.placeholder.com/300x300/00306b/ffffff?text=Logo',
  prefeitura: 'https://via.placeholder.com/120x120/ffffff/00306b?text=P',
  line: 'https://via.placeholder.com/1200x40/00306b/ffffff?text=Linha',
  info156: 'https://via.placeholder.com/120x120/ffffff/00306b?text=156'
});

// Função para formatar data
const formatDateForCover = (date) => {
  if (!date) return '';
  
  // Se já está no formato DD/MM/YYYY, extrair partes
  if (typeof date === 'string' && date.includes('/')) {
    const parts = date.split('/');
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    return `São Paulo, ${day} de ${monthNames[month - 1]} de ${year}`;
  }
  
  // Se é uma data ISO com horário, extrair apenas a parte da data
  let datePart = date;
  if (typeof date === 'string' && date.includes('T')) {
    datePart = date.split('T')[0];
  }
  
  // Converter para objeto Date
  const d = new Date(datePart + 'T00:00:00');
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  return `São Paulo, ${day} de ${month} de ${year}`;
};

// Função para formatar período
const formatPeriodForServicePage = (rel) => {
  if (rel.dataInicio && rel.dataTermino) {
    if (rel.dataInicio === rel.dataTermino) {
      return formatDateForCover(rel.dataInicio);
    }
    return `${formatDateForCover(rel.dataInicio)} a ${formatDateForCover(rel.dataTermino)}`;
  }
  if (rel.data) {
    return formatDateForCover(rel.data);
  }
  return formatDateForCover(new Date());
};

// Função para formatar data para fotos
const formatDateForPhotos = (date) => {
  if (!date) return '';
  
  // Se já está no formato DD/MM/YYYY, retorna como está
  if (typeof date === 'string' && date.includes('/')) {
    return date;
  }
  
  // Se é uma data ISO com horário, extrair apenas a parte da data
  let datePart = date;
  if (typeof date === 'string' && date.includes('T')) {
    datePart = date.split('T')[0];
  }
  
  // Converter para objeto Date
  const d = new Date(datePart + 'T00:00:00');
  
  // Formatar no padrão DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Função para formatar período para fotos
const formatPeriodForPhotos = (dataInicio, dataTermino) => {
  const inicio = formatDateForPhotos(dataInicio);
  const termino = formatDateForPhotos(dataTermino);
  return `${inicio} a ${termino}`;
};

// Constantes dos tipos de serviço
const SUB_REGIOES = {
  SP: "SÃO PAULO",
  CV: "CASA VERDE / LIMÃO / CACHOEIRINHA",
  JT: "JAÇANÃ / TREMEMBÉ",
  MG: "VILA MARIA / VILA GUILHERME",
  ST: "SANTANA / TUCURUVI"
};

const TIPOS_SERVICO = {
  MUTIRAO: "Mutirão - SELIMP",
  REVITALIZACAO: "Revitalização de Pontos Viciados",
  ACUMULADOR: "Ação de Acumulador",
  ALAGAMENTOS: "Limpeza Pós Alagamento",
  ZELADORIA: "Zeladoria",
  DDS: "DDS",
  HIGIENIZACAO: "Higienização, manutenção, instalação, remoção e reposição de Papeleiras",
  VARRICAO_MECANIZADA: "Varrição Mecanizada",
  FEIRAS: "Feiras",
  EVENTOS: "Eventos",
  ROTINEIROS: "Serviços Rotineiros"
};

const TITULOS_RELATORIOS = {
  MUTIRAO: "RELATÓRIO OPERAÇÃO SÃO PAULO LIMPA",
  REVITALIZACAO: "RELATÓRIO DE REVITALIZAÇÃO",
  ACUMULADOR: "RELATÓRIO DE AÇÃO ACUMULADOR",
  ALAGAMENTOS: "RELATÓRIO DE LIMPEZA PÓS ALAGAMENTO",
  ZELADORIA: "RELATÓRIO DE ZELADORIA",
  DDS: "DDS",
  HIGIENIZACAO: "RELATÓRIO DE HIGIENIZAÇÃO",
  VARRICAO_MECANIZADA: "RELATÓRIO DE VARRICAO MECANIZADA",
  FEIRAS: "RELATÓRIO DE FEIRAS",
  EVENTOS: "RELATÓRIO DE EVENTOS",
  ROTINEIROS: "RELATÓRIO DE SERVIÇOS ROTINEIROS"
};

// Função para gerar HTML unificado para todos os tipos de relatório
const generateUnifiedHTML = (rel) => {
  const images = getImageUrls();
  const serviceTitle = TITULOS_RELATORIOS[rel.tipoServico] || 'RELATÓRIO DE SERVIÇO';
  const subRegion = SUB_REGIOES[rel.sub] || rel.sub || 'N/A';
  const reportDate = formatPeriodForServicePage(rel);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de ${TIPOS_SERVICO[rel.tipoServico]}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');
        
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
            min-height: 210mm;
            padding: 40px 60px 40px 30px;
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
        
        /* GRID DE FOTOS DINÂMICO */
        .photos-grid {
            display: grid;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
            align-items: start;
            width: 100%;
            max-width: 100%;
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
            font-size: 11px;
            color: #2c3e50;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 5px;
            text-align: center;
            line-height: 1.2;
        }
        
        /* CABEÇALHO COM LOGOS */
        .photo-header-with-logos {
            position: relative;
            color: white;
            padding: 10px 20px;
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
            }
            
            .page.cover-page,
            .page.service-page,
            .page.content-page {
                page-break-after: always;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            .photo-header-with-logos,
            .photo-descriptors {
                page-break-after: avoid;
                break-after: avoid;
            }
            
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
        <div class="service-period">${reportDate}</div>
        <div class="service-subregion">${subRegion}</div>
        <div class="service-footer-line"></div>
    </div>
    
    ${rel.fotos && rel.fotos.length > 0 ? `
    ${(() => {
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
        
        if (pagePhotos.length > 0) {
          html += `
          <!-- PÁGINA FOTOGRÁFICA ${pageIndex + 1} -->
          <div class="page content-page">
            <div class="photo-header-with-logos">
                <div class="prefeitura-logo"></div>
                <div class="company-logo"></div>
            </div>
            
            ${isFirstPage ? `
            <div class="photo-descriptors">
                <div class="descriptor-item">
                    <strong>PREFEITURA REGIONAL:</strong> ${subRegion}
                </div>
                <div class="descriptor-item">
                    <strong>Serviço(s):</strong> ${TIPOS_SERVICO[rel.tipoServico]}
                </div>
                <div class="descriptor-item">
                    <strong>Local / Evento:</strong> ${rel.local || rel.endereco || 'N/A'}
                </div>
                <div class="descriptor-item">
                    <strong>Descrição:</strong> ${rel.descricao || 'N/A'}
                </div>
                <div class="descriptor-item">
                    <strong>Período/ Data:</strong> ${formatDateForPhotos(rel.data || rel.dataInicio || new Date())}
                </div>
            </div>
            ` : ''}
            
            <div class="photos-grid ${pagePhotos.length === 1 ? 'one-photo' : pagePhotos.length === 2 ? 'two-photos' : 'three-photos'}">
                ${pagePhotos.map((foto, index) => `
                    <div class="photo-item">
                        <div class="photo-container">
                            <img src="${foto.url}" alt="Foto ${startIndex + index + 1}" />
                        </div>
                        ${foto.descricao || foto.etapa ? `<div class="photo-description">${foto.descricao || foto.etapa}</div>` : ''}
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
    
    <!-- PÁGINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `;
};

// Função principal para gerar PDF
const generatePDF = async (relatorio) => {
  console.log('🔄 Iniciando geração de PDF para:', relatorio.tipoServico);
  
  const config = getPdfConfig();
  const html = generateUnifiedHTML(relatorio);
  console.log('📄 HTML gerado, tamanho:', html.length);
  
  const options = {
    content: html,
    ...config
  };
  
  try {
    const pdfBuffer = await pdf.generatePdf(options, { type: 'buffer' });
    console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Erro na geração de PDF:', error);
    throw error;
  }
};

module.exports = {
  generatePDF,
  getPdfConfig,
  getImageUrls
};
