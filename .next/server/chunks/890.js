exports.id=890,exports.ids=[890],exports.modules={16897:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{QK:()=>l,SP:()=>j,YF:()=>k});var e=c(8856),f=c(43344),g=c(95012),h=c(53189),i=a([e]);async function j(a){let b=e.default,c=await b.launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]});try{let b=await c.newPage(),d=function(a){let b=(0,h.E)();return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio Mutir\xe3o</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');
        
        /* ========================================
         * CONFIGURA\xc7\xd5ES DE P\xc1GINA E AJUSTES
         * ========================================
         * 
         * ALTURA DAS CAPAS:
         * - Todas as capas: 100vh (altura total da viewport)
         * - Evita quebras de p\xe1gina desnecess\xe1rias
         * 
         * QUEBRAS DE P\xc1GINA:
         * - \xdaltima p\xe1gina: page-break-after: avoid (evita p\xe1gina em branco)
         * - Demais p\xe1ginas: page-break-after: always
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
        
        /* P\xc1GINA DE CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100vh; /* Altura total da viewport - AJUSTE PARA EVITAR QUEBRA DE P\xc1GINA */
            overflow: hidden;
        }
        
        .cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${b.cover}') center/cover no-repeat;
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
            background: url('${b.logo}') center/contain no-repeat;
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
        
        /* P\xc1GINA DE SERVI\xc7O */
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
            background: url('${b.logo}') center/contain no-repeat;
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
            background: url('${b.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
            
        /* P\xc1GINA DE QUANTITATIVO (CONSOLIDADO) */
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
            background: url('${b.prefeitura}') center/contain no-repeat;
            background-size: contain;
        }

        .quantitative-header-line .company-logo {
            width: 120px;
            height: 80px;
            background: url('${b.logo}') center/contain no-repeat;
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
        
        /* P\xc1GINA DE CAPA DA Subprefeitura - C\xd3PIA DA CONTRACAPA */
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
            background: url('${b.cover}') center/cover no-repeat;
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
        
        /* P\xc1GINA DE Subprefeitura */
        .subregion-page {
            padding: 10mm 60px 10mm 40px;
        }
        
        /* P\xc1GINA DE DESCRI\xc7\xc3O DOS ITENS */
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
        
        /* P\xc1GINA DA TABELA DE INFORMA\xc7\xd5ES */
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
        
        /* TABELA DE INFORMA\xc7\xd5ES */
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
        
        /* P\xc1GINA DE SERVI\xc7O FOTOGR\xc1FICO */
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
        
        /* P\xc1GINA FOTOGR\xc1FICA SIMPLES */
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
        
        /* P\xc1GINA FINAL */
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
            background: url('${b.logo}') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${b.line}') no-repeat;
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
            background: url('${b.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* GRID DE FOTOS DIN\xc2MICO PARA MUTIR\xc3O - REFATORADO */
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
        
        /* Alturas din\xe2micas baseadas no n\xfamero de fotos - OTIMIZADAS PARA A4 LANDSCAPE */
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
        
        
        /* CABE\xc7ALHO DA P\xc1GINA FOTOGR\xc1FICA PARA MUTIR\xc3O */
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
            background: url('${b.logo}') center/contain no-repeat;
        }
        
        /* DESCRITORES PARA MUTIR\xc3O */
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
        
        /* CABE\xc7ALHO COM LOGOS PARA P\xc1GINAS FOTOGR\xc1FICAS */
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
            background: url('${b.prefeitura}') center/contain no-repeat;
            margin-right: 20px;
        }
        
        .company-logo {
            width: 50px;
            height: 50px;
            background: url('${b.logo}') center/contain no-repeat;
            margin-left: 20px;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
            
            /* Configura\xe7\xf5es espec\xedficas para quebra de p\xe1gina */
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
            
            /* Controle espec\xedfico para se\xe7\xe3o fotogr\xe1fica */
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
    <!-- P\xc1GINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELAT\xd3RIO DE <br>EVID\xcaNCIAS</h1>
            <div class="cover-date">S\xe3o Paulo, ${new Date(a.data).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</div>
        </div>
    </div>
    
    <!-- P\xc1GINA DE SERVI\xc7O -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELAT\xd3RIO OPERA\xc7\xc3O <br> S\xc3O PAULO LIMPA</div>
        <div class="service-period">${(0,g.o3)(a.data)}</div>
        <div class="service-subregion">${a.secoes.length>0?f.iU[a.secoes[0].sub]:"N/A"}</div>
        <div class="service-footer-line"></div>
    </div>
    
    <!-- P\xc1GINA DE QUANTITATIVO -->
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
                    <th>Descri\xe7\xe3o do Servi\xe7o</th>
                    <th>Quantidade</th>
                </tr>
            </thead>
            <tbody>
                ${a.quantitativo.map(a=>{let b=String(a.quantidade??"");return b.trim()||(b=a.descricao.includes("km")||a.descricao.includes("Ton")?"0,0":"0"),`
                    <tr>
                        <td>${a.descricao}</td>
                        <td>${b}</td>
                    </tr>
                  `}).join("")}
            </tbody>
        </table>
    </div>
    
    ${a.secoes.map((a,b)=>`
        ${a.mapaFotoUrl?`
            <!-- P\xc1GINA DO MAPA -->
            <div class="page subregion-page">
                <div class="quantitative-header-line">
                    <div class="prefeitura-logo"></div>
                    <div class="company-logo"></div>
                </div>
                <div class="subregion-content">
                    <div class="subregion-info">
                        <h3>Mapa da Opera\xe7\xe3o</h3>
                        <p><strong>Subprefeitura:</strong> ${f.iU[a.sub]}</p>
                        <p><strong>Local/Evento:</strong> ${a.local??"-"}</p>
                        <p><strong>Data:</strong> ${a.data.split("-").reverse().join("/")}</p>
                        <p><strong>Descri\xe7\xe3o:</strong> ${a.descricao||"Nenhuma descri\xe7\xe3o dispon\xedvel"}</p>
                    </div>
                    
                    <div class="team-photo">
                        <img src="${a.mapaFotoUrl}" alt="Mapa da Opera\xe7\xe3o" style="max-width: 400px; max-height: 500px; object-fit: contain;" />
                        <div class="team-photo-caption">Mapa da Opera\xe7\xe3o</div>
                    </div>
                </div>
            </div>
        `:""}
        <!-- P\xc1GINA DA Subprefeitura ${b+1} -->
        <div class="page subregion-page">
            <div class="quantitative-header-line">
                <div class="prefeitura-logo"></div>
                <div class="company-logo"></div>
            </div>
            <div class="subregion-content">
                <div class="subregion-info">
                    <h3>Subprefeitura: ${f.iU[a.sub]}</h3>
                    <p><strong>Local/Evento:</strong> ${a.local??"-"}</p>
                    <p><strong>Data:</strong> ${a.data.split("-").reverse().join("/")}</p>
                    <p><strong>Descri\xe7\xe3o:</strong> ${a.descricao||"Nenhuma descri\xe7\xe3o dispon\xedvel"}</p>
                </div>
                
                ${a.equipeFotoUrl?`
                <div class="team-photo">
                    <img src="${a.equipeFotoUrl}" alt="Foto da Equipe" />
                    <div class="team-photo-caption">Foto da Equipe</div>
                </div>
                `:""}
            </div>
        </div>
            ${a.informacoes.filter(a=>""!==a.descricao.trim()).length>0?`
                <!-- P\xc1GINA DA TABELA DE INFORMA\xc7\xd5ES -->
                <div class="page info-table-page">
                    <div class="info-table-header">
                        <h2>Informa\xe7\xf5es da Sub </h2>
                    </div>
                    
                    <table class="info-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Descri\xe7\xe3o</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${a.informacoes.filter(a=>""!==a.descricao.trim()).map(a=>`
                                <tr>
                                    <td>${a.ordem}</td>
                                    <td>${a.descricao}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `:""}
        </div>
        
        ${a.servicos.map(b=>`
            ${b.fotos.length>0?`
                ${(()=>{let c=Math.ceil(b.fotos.length/3),d="";for(let e=0;e<c;e++){let c=3*e,h=c+3,i=b.fotos.slice(c,h),j=0===e;i.length>0&&(d+=`
                      <!-- P\xc1GINA FOTOGR\xc1FICA DO SERVI\xc7O: ${b.assunto} - P\xe1gina ${e+1} -->
                      <div class="page service-photo-page">
                        <div class="quantitative-header-line">
                            <div class="prefeitura-logo"></div>
                            <div class="company-logo"></div>
                        </div>

                    ${j?`
                    <div class="photo-descriptors">
                        <div class="descriptor-item">
                            <strong>Subprefeitura:</strong> ${f.iU[a.sub]}
                        </div>
                        <div class="descriptor-item">
                            <strong>Opera\xe7\xe3o S\xe3o Paulo Limpa:</strong> 
                        </div>
                        <div class="descriptor-item">
                            <strong>Servi\xe7o(s):</strong> ${b.assunto}
                        </div>
                        <div class="descriptor-item">
                            <strong>Data:</strong> ${(0,g.oh)(a.data)}
                        </div>
                    </div>
                    `:""}
                          
                          <div class="photos-grid ${1===i.length?"one-photo":2===i.length?"two-photos":"three-photos"}">
                              ${i.map((a,b)=>`
                                  <div class="photo-item">
                                      <div class="photo-container">
                                          <img src="${a.url}" alt="Foto ${c+b+1}" />
                                      </div>
                                      ${a.descricao?`<div class="photo-description">${a.descricao}</div>`:""}
                                  </div>
                              `).join("")}
                          </div>
                      </div>
                      `)}return d})()}
            `:""}
        `).join("")}
    `).join("")}
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `}(a);return await b.setContent(d,{waitUntil:"networkidle0"}),await new Promise(a=>setTimeout(a,2e3)),await b.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}})}finally{await c.close()}}async function k(a){let b=e.default,c=await b.launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]});try{let b=await c.newPage(),d=function(a){let b=(0,h.E)();return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio de Evid\xeancias</title>
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
        
        /* P\xc1GINA DE CAPA */
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
            background: url('${b.cover}') center/cover;
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
            background: url('${b.logo}') center/contain no-repeat;
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
        
        /* P\xc1GINA DE SERVI\xc7O */
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
            background: url('${b.logo}') center/contain no-repeat;
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
            background: url('${b.line}') no-repeat;
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
        
        /* P\xc1GINA FOTOGR\xc1FICA */
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
    <!-- P\xc1GINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELAT\xd3RIO DE<br> EVID\xcaNCIAS</h1>
            <div class="cover-date">S\xe3o Paulo, ${new Date(a.dataInicio).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</div>
        </div>
    </div>
    
    <!-- P\xc1GINA DE SERVI\xc7O -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELAT\xd3RIO OPERA\xc7\xc3O <br> S\xc3O PAULO LIMPA</div>
        <div class="service-period">${(0,g.kq)(a)}</div>
        <div class="service-subregion">${f.iU[a.sub]}</div>
        <div class="service-footer-line"></div>
    </div>
    
    <!-- P\xc1GINA FOTOGR\xc1FICA -->
    <div class="page photo-page">
        <div class="photo-header">
            <h2>Registro Fotogr\xe1fico</h2>
        </div>
        
        <div class="photo-info">
            <p><strong>Assunto:</strong> ${a.assunto}</p>
            <p><strong>Subprefeitura:</strong> ${f.iU[a.sub]||a.sub}</p>
            <p><strong>Data:</strong> ${a.dataInicio===a.dataTermino?(0,g.o3)(a.dataInicio):`${(0,g.o3)(a.dataInicio)} a ${(0,g.o3)(a.dataTermino)}`}</p>
            <p><strong>Local:</strong> ${a.local||"-"}</p>
            <p><strong>Total de Fotos:</strong> ${a.fotos.length}</p>
        </div>
        
        <div class="photo-grid">
            ${a.fotos.map((a,b)=>`
                <div class="photo-item">
                    <img src="${a.url}" alt="Foto ${b+1}" />
                    ${a.descricao?`<div class="photo-caption">${a.descricao}</div>`:""}
                </div>
            `).join("")}
        </div>
    </div>
</body>
</html>
  `}(a);return await b.setContent(d,{waitUntil:"networkidle0"}),await new Promise(a=>setTimeout(a,2e3)),await b.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}})}finally{await c.close()}}async function l(a,b){let c=e.default,d=await c.launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]});try{let c=await d.newPage(),e=function(a,b){let c=(0,h.E)(),d=a.sort((a,b)=>{let c=a.secoes[0]?.sub||"SP",d=b.secoes[0]?.sub||"SP",e={CV:1,JT:2,MG:3,ST:4,SP:5},f=e[c]||999,g=e[d]||999;return f-g}).reduce((a,b)=>{let c=b.secoes[0]?.sub||"SP";return a[c]||(a[c]=[]),a[c].push(b),a},{});return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio de Evid\xeancias - Mutir\xf5es</title>
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
        
        /* P\xc1GINA DE CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100vh; /* Altura total da viewport - AJUSTE PARA EVITAR QUEBRA DE P\xc1GINA */
            overflow: hidden;
        }
        
        .cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${c.cover}') center/cover no-repeat;
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
            background: url('${c.logo}') center/contain no-repeat;
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
        
        /* P\xc1GINA DE SERVI\xc7O */
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
            background: url('${c.logo}') center/contain no-repeat;
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
            background: url('${c.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* P\xc1GINA DE QUANTITATIVO */
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
        
        /* P\xc1GINA DE INFORMA\xc7\xd5ES GERAIS */
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
            background: url('${c.prefeitura}') center/contain no-repeat;
        }
        
        .info-header-line .company-logo {
            position: absolute;
            right: 20px;
            top: 0px;
            transform: translateY(-50%);
            width: 120px;
            height: 100px;
            background: url('${c.logo}') center/contain no-repeat;
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
            background: url('${c.info156}') center/contain no-repeat;
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
            background: url('${c.prefeitura}') center/contain no-repeat;
        }
        
        .quantitative-header-line .company-logo {
            position: absolute;
            right: 20px;
            top: 0px;
            transform: translateY(-50%);
            width: 120px;
            height: 100px;
            background: url('${c.logo}') center/contain no-repeat;
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
        
        /* P\xc1GINA DE Subprefeitura */
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
        /* P\xc1GINA DE DESCRI\xc7\xc3O DOS ITENS */
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
        
        /* P\xc1GINA DA TABELA DE INFORMA\xc7\xd5ES */
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
        
        /* TABELA DE INFORMA\xc7\xd5ES */
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
        
        /* P\xc1GINA DE SERVI\xc7O FOTOGR\xc1FICO */
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
        
        /* GRID DE FOTOS DIN\xc2MICO PARA MUTIR\xc3O CONSOLIDADO - REFATORADO */
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
        
        /* Alturas din\xe2micas baseadas no n\xfamero de fotos - OTIMIZADAS PARA A4 LANDSCAPE */
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
        
        /* CABE\xc7ALHO DA P\xc1GINA FOTOGR\xc1FICA PARA MUTIR\xc3O */
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
            background: url('${c.logo}') center/contain no-repeat;
        }
        
        /* DESCRITORES PARA MUTIR\xc3O */
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
        
        /* CABE\xc7ALHO COM LOGOS PARA P\xc1GINAS FOTOGR\xc1FICAS */
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
            background: url('${c.prefeitura}') center/contain no-repeat;
            margin-right: 30px;
        }
        
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${c.logo}') center/contain no-repeat;
            margin-left: 30px;
        }
        
        /* P\xc1GINA FINAL */
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
            background: url('${c.logo}') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${c.line}') no-repeat;
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
            background: url('${c.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
            
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
            
            /* Configura\xe7\xf5es espec\xedficas para quebra de p\xe1gina */
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
            
            /* Controle espec\xedfico para se\xe7\xe3o fotogr\xe1fica */
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
    <!-- P\xc1GINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELAT\xd3RIO DE<br> EVID\xcaNCIAS</h1>
            <div class="cover-date">S\xe3o Paulo, ${new Date(b).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</div>
        </div>
    </div>
    
    <!-- P\xc1GINA DE SERVI\xc7O -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELAT\xd3RIO OPERA\xc7\xc3O <br> S\xc3O PAULO LIMPA</div>
        <div class="service-period">${(0,g.o3)(b)}</div>
        <div class="service-subregion">EVID\xcaNCIAS CONSOLIDADAS</div>
        <div class="service-footer-line"></div>
    </div>
    
    <!-- P\xc1GINA DE INFORMA\xc7\xd5ES GERAIS -->
    <div class="page info-page">
        <div class="info-header-line">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
        <div class="info-header">
            <h2>Informa\xe7\xf5es Gerais</h2>
        </div>
        
        <div class="info-date">
            Data: ${(()=>{let a=new Date(b);return a.setDate(a.getDate()+1),a.toLocaleDateString("pt-BR")})()}
        </div>
        
        <table class="info-table">
            <thead>
                <tr>
                    <th colspan="6" style="text-align: center;">Quantitativo do Mutir\xe3o - Opera\xe7\xe3o S\xe3o Paulo Limpa</th>
                </tr>
                <tr>
                    <th style="text-align: center;">Subprefeitura</th>
                    <th style="text-align: center;">Endere\xe7o</th>
                    <th style="text-align: center;">Colaboradores</th>
                    <th style="text-align: center;">Qnt. ve\xedculos</th>
                    <th style="text-align: center;">Bocas de lobo limpas</th>
                    <th style="text-align: center;">Volume de res\xedduos coletados (Ton.)</th>
                </tr>
            </thead>
            <tbody>
                ${(function(a){let b={CV:"Casa Verde / Lim\xe3o / Cachoeirinha",JT:"Ja\xe7an\xe3 / Trememb\xe9",MG:"Vila Maria / Vila Guilherme",ST:"Santana / Tucuruvi"},c=a.reduce((a,b)=>{let c=b.secoes[0]?.sub||"SP";return a[c]||(a[c]=[]),a[c].push(b),a},{}),d=Object.entries(c).map(([a,c])=>{let d=c[0]?.secoes[0]?.local||"",e=0,f=0,g=0,h=0;return c.forEach(a=>{a.quantitativo.forEach(a=>{let b="number"==typeof a.quantidade?a.quantidade:"string"==typeof a.quantidade&&a.quantidade.trim()&&parseFloat(a.quantidade.replace(",","."))||0,c=a.descricao.toLowerCase();c.includes("colaborador")?e+=b:c.includes("equipamento")?f+=b:c.includes("boca")||c.includes("lobo")?g+=b:(c.includes("volume")||c.includes("res\xedduo")||c.includes("residuo"))&&(h+=b)})}),{subprefeitura:b[a]||a,endereco:d,colaboradores:e,veiculos:f,bocasLobo:g,volumeResiduos:h}}),e={CV:1,JT:2,MG:3,ST:4,SP:5};return d.sort((a,c)=>{let d=Object.keys(b).find(c=>b[c]===a.subprefeitura)||"SP",f=Object.keys(b).find(a=>b[a]===c.subprefeitura)||"SP",g=e[d]||999,h=e[f]||999;return g-h})})(a).map(a=>`
                    <tr>
                        <td>${a.subprefeitura}</td>
                        <td>${a.endereco}</td>
                        <td>${a.colaboradores}</td>
                        <td>${a.veiculos}</td>
                        <td>${a.bocasLobo}</td>
                        <td>${a.volumeResiduos}</td>
                    </tr>
                  `).join("")}
            </tbody>
        </table>
        
        <div class="info-footer-image"></div>
    </div>
    
    <!-- P\xc1GINA DE QUANTITATIVO -->
    <div class="page quantitative-page">

        <div class="quantitative-header-line">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
        <div class="subprefeituras-list">
            ${function(a){let b={CV:["Casa Verde","Lim\xe3o","Cachoeirinha"],JT:["Ja\xe7an\xe3","Trememb\xe9"],MG:["Vila Maria","Vila Guilherme"],ST:["Santana","Tucuruvi"]},c=[...new Set(a.map(a=>a.secoes[0]?.sub||"SP"))],d={CV:1,JT:2,MG:3,ST:4,SP:5};c.sort((a,b)=>{let c=d[a]||999,e=d[b]||999;return c-e});let e=c.map(a=>b[a]||[a]).map(a=>a.join(" / ")).join(" | ");return`Subprefeituras: ${e}`}(a)}
        </div>
        <div class="quantitative-header-total">
            <h2>QUANTITATIVO TOTAL</h2>
        </div>
        
        <table class="quantitative-table">
            <thead>
                <tr>
                    <th>Descri\xe7\xe3o do Servi\xe7o</th>
                    <th>Quantidade</th>
                </tr>
            </thead>
            <tbody>
                ${(()=>{let b={};return a.forEach(a=>{a.quantitativo.forEach(a=>{let c=a.descricao,d="number"==typeof a.quantidade?a.quantidade:"string"==typeof a.quantidade&&a.quantidade.trim()&&parseFloat(a.quantidade.replace(",","."))||0;b[c]||(b[c]=0),b[c]+=d})}),Object.entries(b).map(([a,b])=>`
                    <tr>
                        <td>${a}</td>
                        <td>${b%1==0?b.toString():b.toFixed(1).replace(".",",")}</td>
                    </tr>
                  `).join("")})()}
            </tbody>
        </table>
    </div>
    
    ${Object.entries(d).map(([a,c])=>{let d={CV:"CASA VERDE / LIM\xc3O / CACHOEIRINHA",JT:"JA\xc7AN\xc3 / TREMEMB\xc9",MG:"VILA MARIA / VILA GUILHERME",ST:"SANTANA / TUCURUVI"}[a]||a;return`

    <!-- CAPA DA Subprefeitura: ${a} -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELAT\xd3RIO OPERA\xc7\xc3O <br> S\xc3O PAULO LIMPA</div>
        <div class="subregion-cover-title">${d}</div>
        <div class="subregion-cover-date">${(0,g.o3)(b)}</div>
        <div class="service-footer-line"></div>

    </div>

        
        ${c.map((b,c)=>`
            ${b.secoes.map((b,c)=>`
                ${b.mapaFotoUrl?`
                    <!-- P\xc1GINA DO MAPA DA Subprefeitura: ${a} -->
                    <div class="page subregion-page">
                        <div class="photo-header-with-logos">
                            <div class="prefeitura-logo"></div>
                            <div class="company-logo"></div>
                        </div>
                        <div class="subregion-content">
                            <div class="subregion-info">
                                <h3>Opera\xe7\xe3o S\xe3o Paulo Limpa</h3>
                                <p><strong>Subprefeitura / Regional:</strong> ${d}</p>
                                <p><strong>Servi\xe7o:</strong> Mutir\xe3o</p>
                                <p><strong>Local:</strong> ${b.local??"-"}</p>
                                <p><strong>Data:</strong> ${b.data.split("-").reverse().join("/")}</p>
                                <p><strong>Descri\xe7\xe3o:</strong> ${b.descricao||"Nenhuma descri\xe7\xe3o dispon\xedvel"}</p>
                            </div>
                            
                            <div class="team-photo">
                                <img src="${b.mapaFotoUrl}" alt="Mapa da Opera\xe7\xe3o" />
                                <div class="team-photo-caption">Mapa da Opera\xe7\xe3o</div>
                            </div>
                        </div>
                    </div>
                `:""}
                
                ${b.equipeFotoUrl?`
                    <!-- P\xc1GINA DA FOTO DA EQUIPE: ${a} -->
                    <div class="page subregion-page">
                        <div class="photo-header-with-logos">
                            <div class="prefeitura-logo"></div>
                            <div class="company-logo"></div>
                        </div>
                        <div class="subregion-content">
                            <div class="subregion-info">
                                <h3>Opera\xe7\xe3o S\xe3o Paulo Limpa</h3>
                                <p><strong>Subprefeitura / Regional:</strong> ${d}</p>
                                <p><strong>Servi\xe7o:</strong> Mutir\xe3o</p>
                                <p><strong>Local:</strong> ${b.local??"-"}</p>
                                <p><strong>Data:</strong> ${b.data.split("-").reverse().join("/")}</p>
                                <p><strong>Descri\xe7\xe3o:</strong> ${b.descricao||"Nenhuma descri\xe7\xe3o dispon\xedvel"}</p>
                            </div>
                            
                            <div class="team-photo">
                                <img src="${b.equipeFotoUrl}" alt="Foto da Equipe" />
                                <div class="team-photo-caption">Foto da Equipe</div>
                            </div>
                        </div>
                    </div>
                `:""}
                
                ${b.informacoes.filter(a=>""!==a.descricao.trim()).length>0?`
                    <!-- P\xc1GINA DA TABELA DE INFORMA\xc7\xd5ES: ${a} -->
                    <div class="page items-description-page">
                    <div class="subregion-name">
                        <h3 class="subregion-name-title">Subprefeitura: ${d}</h3> 
                    </div>
                        <div class="items-description-header">
                            <h2>INFORMA\xc7\xd5ES</h2>
                        </div>
                        
                        <table class="items-description-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Descri\xe7\xe3o</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${b.informacoes.filter(a=>""!==a.descricao.trim()).map(a=>`
                                    <tr>
                                        <td>${a.ordem}</td>
                                        <td>${a.descricao}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                `:""}
            `).join("")}
        `).join("")}
        
        <!-- P\xc1GINA DE QUANTITATIVO DA Subprefeitura -->
        <div class="page quantitative-page">
            <div class="quantitative-header-line">
                <div class="prefeitura-logo"></div>
                <div class="company-logo"></div>
            </div>
            <div class="quantitative-header">
                <h2>Quantitativo da Subprefeitura</h2>
                <p>${d}</p>
            </div>
            
            <table class="quantitative-table">
                <thead>
                    <tr>
                        <th>Descri\xe7\xe3o do Servi\xe7o</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    ${(()=>{let a={};return c.forEach(b=>{b.quantitativo.forEach(b=>{let c=b.descricao,d="number"==typeof b.quantidade?b.quantidade:"string"==typeof b.quantidade&&b.quantidade.trim()&&parseFloat(b.quantidade.replace(",","."))||0;a[c]||(a[c]=0),a[c]+=d})}),Object.entries(a).map(([a,b])=>`
                        <tr>
                            <td>${a}</td>
                            <td>${b%1==0?b.toString():b.toFixed(1).replace(".",",")}</td>
                        </tr>
                      `).join("")})()}
                </tbody>
            </table>
        </div>
        
        ${c.map((a,b)=>`
            ${a.secoes.map((a,b)=>`
                
                ${a.servicos.map(b=>`
                    ${b.fotos.length>0?`
                        ${(()=>{let c=Math.ceil(b.fotos.length/3),e="";for(let f=0;f<c;f++){let c=3*f,h=c+3,i=b.fotos.slice(c,h),j=0===f;i.length>0&&(e+=`
                              <!-- P\xc1GINA FOTOGR\xc1FICA DO SERVI\xc7O: ${b.assunto} - P\xe1gina ${f+1} -->
                              <div class="page service-photo-page">
                                  <div class="photo-header-with-logos">
                                      <div class="prefeitura-logo"></div>
                                      <h2> ${b.fotos.length>3?`- P\xe1gina ${f+1}`:""}</h2>
                                      <div class="company-logo"></div>
                                  </div>
                                  
                                  ${j?`
                                  <div class="photo-descriptors">
                                      <div class="descriptor-item">
                                          <strong>PREFEITURA REGIONAL:</strong> ${d}
                                      </div>
                                      <div class="descriptor-item">
                                          <strong>Opera\xe7\xe3o S\xe3o Paulo Limpa</strong>
                                      </div>
                                      <div class="descriptor-item">
                                          <strong>Servi\xe7o(s):</strong> ${b.assunto}
                                      </div>
                                      <div class="descriptor-item">
                                          <strong>Data:</strong> ${(0,g.oh)(a.data)}
                                      </div>
                                  </div>
                                  `:""}
                                  
                                  <div class="photos-grid ${1===i.length?"one-photo":2===i.length?"two-photos":"three-photos"}">
                                      ${i.map((a,b)=>`
                                          <div class="photo-item">
                                              <div class="photo-container">
                                                  <img src="${a.url}" alt="Foto ${c+b+1}" />
                                              </div>
                                              ${a.descricao?`<div class="photo-description">${a.descricao}</div>`:""}
                                          </div>
                                      `).join("")}
                                  </div>
                              </div>
                              `)}return e})()}
                    `:""}
                `).join("")}
            `).join("")}
        `).join("")}
      `}).join("")}
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `}(a,b);return await c.setContent(e,{waitUntil:"networkidle0"}),await new Promise(a=>setTimeout(a,2e3)),await c.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}})}finally{await d.close()}}e=(i.then?(await i)():i)[0],d()}catch(a){d(a)}})},43344:(a,b,c)=>{"use strict";c.d(b,{iU:()=>d,k4:()=>e,mN:()=>f});let d={SP:"S\xc3O PAULO",CV:"CASA VERDE / LIM\xc3O / CACHOEIRINHA",JT:"JA\xc7AN\xc3 / TREMEMB\xc9",MG:"VILA MARIA / VILA GUILHERME",ST:"SANTANA / TUCURUVI"},e={MUTIRAO:"Mutir\xe3o - SELIMP",REVITALIZACAO:"Revitaliza\xe7\xe3o de Pontos Viciados",ACUMULADOR:"A\xe7\xe3o de Acumulador",ALAGAMENTOS:"Limpeza P\xf3s Alagamento",ZELADORIA:"Zeladoria",DDS:"DDS",HIGIENIZACAO:"Higieniza\xe7\xe3o, manuten\xe7\xe3o, instala\xe7\xe3o, remo\xe7\xe3o e reposi\xe7\xe3o de Papeleiras",VARRICAO_MECANIZADA:"Varri\xe7\xe3o Mecanizada",FEIRAS:"Feiras",EVENTOS:"Eventos",ROTINEIROS:"Servi\xe7os Rotineiros"},f={MUTIRAO:"RELAT\xd3RIO OPERA\xc7\xc3O S\xc3O PAULO LIMPA",REVITALIZACAO:"RELAT\xd3RIO DE REVITALIZA\xc7\xc3O",ACUMULADOR:"RELAT\xd3RIO DE A\xc7\xc3O ACUMULADOR",ALAGAMENTOS:"RELAT\xd3RIO DE LIMPEZA P\xd3S ALAGAMENTO",ZELADORIA:"RELAT\xd3RIO DE ZELADORIA",DDS:"DDS",HIGIENIZACAO:"RELAT\xd3RIO DE HIGIENIZA\xc7\xc3O",VARRICAO_MECANIZADA:"RELAT\xd3RIO DE VARRICAO MECANIZADA",FEIRAS:"RELAT\xd3RIO DE FEIRAS",EVENTOS:"RELAT\xd3RIO DE EVENTOS",ROTINEIROS:"RELAT\xd3RIO DE SERVI\xc7OS ROTINEIROS"}},53189:(a,b,c)=>{"use strict";c.d(b,{E:()=>i});var d=c(29021),e=c.n(d),f=c(33873),g=c.n(f);function h(a){try{let b=g().join(process.cwd(),"public",a),c=e().readFileSync(b).toString("base64"),d=g().extname(a).slice(1);return`data:image/${d};base64,${c}`}catch(b){return console.error(`Erro ao carregar imagem ${a}:`,b),""}}function i(){return{cover:h("imgs/cover.png"),logo:h("imgs/logo.png"),line:h("imgs/line.png"),prefeitura:h("imgs/prefeitura.png"),info156:h("imgs/156.png")}}},78335:()=>{},86012:(a,b,c)=>{"use strict";function d(a){let b=("MUTIRAO"===a.tipoServico&&"data"in a?new Date(a.data+"T00:00:00"):"ACUMULADOR"===a.tipoServico||"ALAGAMENTOS"===a.tipoServico||"ZELADORIA"===a.tipoServico?new Date(a.dataInicio+"T00:00:00"):"REVITALIZACAO"===a.tipoServico&&"data"in a||"HIGIENIZACAO"===a.tipoServico&&"data"in a||"VARRICAO_MECANIZADA"===a.tipoServico&&"data"in a||"FEIRAS"===a.tipoServico&&"data"in a||"ROTINEIROS"===a.tipoServico&&"data"in a?new Date(a.data+"T00:00:00"):new Date).toLocaleDateString("pt-BR").replace(/\//g,".");switch(a.tipoServico){case"MUTIRAO":if("secoes"in a&&a.secoes.length>0){let c=a.secoes[0].sub;return`Relat\xf3rio Opera\xe7\xe3o SP Limpa ${c} - ${b} - Limpebras`}return`Relat\xf3rio Opera\xe7\xe3o SP Limpa - ${b} - Limpebras`;case"ACUMULADOR":if("sub"in a)return`Relat\xf3rio A\xe7\xe3o de Acumulador ${a.sub} - ${b} - Limpebras`;return`Relat\xf3rio A\xe7\xe3o de Acumulador - ${b} - Limpebras`;case"ZELADORIA":case"REVITALIZACAO":case"HIGIENIZACAO":case"VARRICAO_MECANIZADA":case"FEIRAS":case"ROTINEIROS":return`Relat\xf3rio Fotogr\xe1fico - ${b} - Limpebras`;case"ALAGAMENTOS":if("sub"in a)return`Relat\xf3rio P\xf3s Alagamento ${a.sub} - ${b} - Limpebras`;return`Relat\xf3rio P\xf3s Alagamento - ${b} - Limpebras`;default:return`Relat\xf3rio - ${b} - Limpebras`}}function e(a){let b=(a?new Date(a+"T00:00:00"):new Date).toLocaleDateString("pt-BR").replace(/\//g,".");return`Relat\xf3rio Opera\xe7\xe3o SP Limpa - ${b} - Limpebras`}function f(a){return`Relat\xf3rio Revitaliza\xe7\xf5es - ${a} - LimpaSP`}function g(a){return`Relatorio Servicos Rotineiros - ${a} - LimpaSP`}c.d(b,{S8:()=>g,gh:()=>e,hP:()=>d,lu:()=>f})},95012:(a,b,c)=>{"use strict";function d(a){let b,c,d;if(!a)return"";if(a.includes("/")){let e=a.split("/");b=parseInt(e[0]),c=parseInt(e[1]),d=parseInt(e[2])}else{let e=a.split("-");d=parseInt(e[0]),c=parseInt(e[1]),b=parseInt(e[2])}return`S\xe3o Paulo, ${b} de ${["Janeiro","Fevereiro","Mar\xe7o","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][c-1]} de ${d}`}function e(a){let b,c,d;if(!a)return"";if(a.includes("/")){let e=a.split("/");b=parseInt(e[0]),c=parseInt(e[1]),d=parseInt(e[2])}else{let e=a.split("-");d=parseInt(e[0]),c=parseInt(e[1]),b=parseInt(e[2])}let e=b.toString().padStart(2,"0"),f=c.toString().padStart(2,"0");return`${e}/${f}/${d}`}function f(a,b){let c=e(a);if(!b||a===b)return c;let d=e(b);return`${c} a ${d}`}function g(a){if("MUTIRAO"===a.tipoServico&&"data"in a)return d(a.data);if("dataInicio"in a&&"dataTermino"in a){let b=e(a.dataInicio||"");if(!a.dataTermino||a.dataInicio===a.dataTermino)return`Data: ${b}`;let c=e(a.dataTermino);return`Per\xedodo: ${b} a ${c}`}return"data"in a?`Data: ${e(a.data)}`:""}c.d(b,{kq:()=>g,o3:()=>d,oh:()=>e,vy:()=>f})},96487:()=>{}};