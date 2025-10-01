"use strict";exports.id=86,exports.ids=[86],exports.modules={58848:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{g:()=>k});var e=c(8856),f=c(47018),g=c(43344),h=c(95012),i=c(53189),j=a([e,f]);async function k(a,b){console.log(`🚀 Iniciando gera\xe7\xe3o de PDF para ${b.length} servi\xe7o(s) rotineiro(s)`),console.log("\uD83D\uDCC5 M\xeas/Ano:",a),console.log("\uD83D\uDCCA Dados dos rotineiros:",b);let c=b.reduce((a,b)=>a+b.servicos.length,0),d=b.reduce((a,b)=>a+b.servicos.reduce((a,b)=>a+b.fotos.length,0),0);if(console.log(`📊 Total de servi\xe7os: ${c}, Total de fotos: ${d}`),0===c)throw Error("Nenhum servi\xe7o encontrado para gerar o PDF");let j=function(a,b){let c=(0,i.E)();return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio Servi\xe7os Rotineiros</title>
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
        .page.service-photo-page {
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
        
        /* DESCRITORES PARA SERVI\xc7OS ROTINEIROS */
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
        
        /* GRID DE FOTOS DIN\xc2MICO */
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
        
        /* Alturas din\xe2micas baseadas no n\xfamero de fotos - OTIMIZADAS PARA A4 LANDSCAPE */
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
            background: url('${c.prefeitura}') center/contain no-repeat;
            background-size: contain;
        }

        .quantitative-header-line .company-logo {
            width: 120px;
            height: 80px;
            background: url('${c.logo}') center/contain no-repeat;
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
            <h1 class="cover-title">RELAT\xd3RIO DE <br>EVID\xcaNCIAS</h1>
            <div class="cover-date">S\xe3o Paulo, ${a}</div>
        </div>
    </div>
    
    ${["CV","JT","MG","ST"].map(c=>{let d=b.filter(a=>a.sub===c);if(0===d.length)return"";let e=d.sort((a,b)=>new Date(a.data).getTime()-new Date(b.data).getTime());return`
                <!-- CONTRACAPA DA SUB-REGI\xc3O ${g.iU[c]} -->
                <div class="page service-page">
                    <div class="service-logo"></div>
                    <div class="service-title">RELAT\xd3RIO DE <br>SERVI\xc7OS ROTINEIROS</div>
                    <div class="service-period">${a}</div>
                    <div class="service-subregion">${g.iU[c]}</div>
                    <div class="service-footer-line"></div>
                </div>
                
                <!-- SERVI\xc7OS DA SUB-REGI\xc3O ${g.iU[c]} -->
                ${e.map(a=>a.servicos.map((b,c)=>{let d=Math.ceil(b.fotos.length/3);return Array.from({length:d},(c,d)=>{let e=3*d,f=b.fotos.slice(e,e+3);return f.length>0?`
                                  <!-- P\xc1GINA FOTOGR\xc1FICA DO SERVI\xc7O: ${b.assunto} - P\xe1gina ${d+1} -->
                                  <div class="page service-photo-page">
                                    <div class="quantitative-header-line">
                                        <div class="prefeitura-logo"></div>
                                        <div class="company-logo"></div>
                                    </div>

                                ${0===d?`
                                <div class="photo-descriptors">
                                    <div class="descriptor-item">
                                        <strong>Subprefeitura:</strong> ${g.iU[a.sub]}
                                    </div>
                                    <div class="descriptor-item">
                                        <strong>Servi\xe7os Rotineiros</strong> 
                                    </div>
                                    <div class="descriptor-item">
                                        <strong>Servi\xe7o(s):</strong> ${b.assunto}
                                    </div>
                                    <div class="descriptor-item">
                                        <strong>Data:</strong> ${(0,h.oh)(a.data)}
                                    </div>
                                </div>
                                `:""}
                                      
                                      <div class="photos-grid ${1===f.length?"one-photo":2===f.length?"two-photos":"three-photos"}">
                                          ${f.map((a,b)=>`
                                              <div class="photo-item">
                                                  <div class="photo-container">
                                                      <img src="${a.url}" alt="Foto ${e+b+1}" />
                                                  </div>
                                                  ${a.descricao?`<div class="photo-description">${a.descricao}</div>`:""}
                                              </div>
                                          `).join("")}
                                      </div>
                                  </div>
                                  `:""}).join("")}).join("")).join("")}
            `}).join("")}
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>`}(a,b);console.log("\uD83D\uDCC4 HTML gerado:",j.substring(0,500)+"...");let k=e.default;if(!k)throw Error("Puppeteer n\xe3o dispon\xedvel");console.log("\uD83D\uDD27 Usando puppeteer:","puppeteer-core");let l=await (0,f.p)();console.log("⚙️ Configura\xe7\xe3o do puppeteer:",l);let m=await k.launch(l);console.log("\uD83D\uDE80 Browser lan\xe7ado com sucesso");try{let a=await m.newPage();console.log("\uD83D\uDCC4 P\xe1gina criada com sucesso"),a.setDefaultTimeout(3e4),a.setDefaultNavigationTimeout(3e4),await a.setViewport({width:1123,height:794,deviceScaleFactor:1}),console.log("\uD83D\uDDA5️ Viewport configurado"),console.log("\uD83D\uDCC4 Carregando HTML na p\xe1gina...");try{await a.setContent(j,{waitUntil:"domcontentloaded",timeout:6e4}),console.log("\uD83D\uDCC4 HTML carregado na p\xe1gina"),console.log("⏳ Aguardando carregamento das imagens...");let b=0;for(;b<30;){let c=await a.evaluate(()=>{let a=document.querySelectorAll("img"),b=a.length,c=0;for(let b of a)b.complete&&0!==b.naturalHeight&&c++;return{total:b,loaded:c,allLoaded:c===b&&b>0}});if(console.log(`📊 Imagens: ${c.loaded}/${c.total} carregadas`),c.allLoaded||0===c.total){console.log("✅ Todas as imagens carregadas!");break}await new Promise(a=>setTimeout(a,1e4)),b++}b>=30&&console.warn("⚠️ Timeout no carregamento de imagens, mas continuando com o PDF...")}catch(a){throw console.error("❌ Erro ao carregar HTML:",a),a}if(a.isClosed())throw Error("P\xe1gina foi fechada antes da gera\xe7\xe3o do PDF");console.log("\uD83D\uDD04 Iniciando gera\xe7\xe3o do PDF...");let b=await a.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0",right:"0",bottom:"0",left:"0"},preferCSSPageSize:!0,timeout:12e5});return console.log(`✅ PDF gerado com sucesso! Tamanho: ${b.length} bytes`),b}catch(a){if(console.error("❌ Erro durante a gera\xe7\xe3o do PDF:",a),console.error("❌ Stack trace:",a instanceof Error?a.stack:"No stack trace"),a instanceof Error&&a.message.includes("Target closed"))throw console.error("\uD83D\uDD0D Browser foi fechado prematuramente. Tentando novamente..."),Error("Browser foi fechado durante a gera\xe7\xe3o do PDF. Tente novamente.");throw a}finally{await m.close(),console.log("\uD83D\uDD12 Browser fechado")}}[e,f]=j.then?(await j)():j,d()}catch(a){d(a)}})}};