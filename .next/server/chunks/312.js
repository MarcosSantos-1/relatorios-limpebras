"use strict";exports.id=312,exports.ids=[312],exports.modules={16312:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{F5:()=>l,fU:()=>m});var e=c(8856),f=c(47018),g=c(43344),h=c(53189),i=c(95012),j=a([e,f]);function k(a){let b;if("string"==typeof a)if(a.includes("/")){let c=a.split("/"),d=parseInt(c[0]),e=parseInt(c[1])-1,f=parseInt(c[2]);b=new Date(f,e,d)}else{let c=a.split("-"),d=parseInt(c[0]),e=parseInt(c[1])-1,f=parseInt(c[2]);b=new Date(d,e,f)}else b=a;let c=b.toLocaleDateString("pt-BR",{month:"long"}),d=b.getFullYear();return`S\xe3o Paulo, ${c.charAt(0).toUpperCase()+c.slice(1)} de ${d}`}async function l(a){let b=await (0,f.p)(),c=await e.default.launch(b);try{let b=await c.newPage();await b.setViewport({width:1123,height:794});let d=function(a){var b;let c=(0,h.E)(),d=(b=a.tipoServico,g.mN[b]||"RELAT\xd3RIO DE SERVI\xc7O"),e="sub"in a?g.iU[a.sub]||a.sub:"secoes"in a&&a.secoes.length>0?g.iU[a.secoes[0].sub]||a.secoes[0].sub:"N/A",f=function(a){if("DDS"===a.tipoServico&&"dataInicio"in a&&a.dataInicio)return k(a.dataInicio);if("data"in a&&a.data&&!a.data.includes(" a "))return k(a.data);if("dataInicio"in a&&"dataTermino"in a){if(a.dataInicio&&a.dataTermino)return a.dataInicio===a.dataTermino?k(a.dataInicio):`${k(a.dataInicio)} a ${k(a.dataTermino)}`;if(a.dataInicio)return k(a.dataInicio)}return k(new Date)}(a);return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio de ${g.k4[a.tipoServico]}</title>
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
        
        .cover-logo {
            position: absolute;
            top: -90px;
            right: 80px;
            width: 330px;
            height: 330px;
            background: url('${c.logo}') center/contain no-repeat;
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
        
        /* P\xc1GINA DE SERVI\xc7O */
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
        
        /* P\xc1GINA DE CONTE\xdaDO */
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
        
        /* GRID DE FOTOS DIN\xc2MICO PARA REVITALIZA\xc7\xc3O - REFATORADO */
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
        
        /* CABE\xc7ALHO DA P\xc1GINA FOTOGR\xc1FICA */
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
            background: url('${c.logo}') center/contain no-repeat;
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
        
        /* CABE\xc7ALHO COM LOGOS PARA P\xc1GINAS FOTOGR\xc1FICAS */
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
            background: url('${c.prefeitura}') center/contain no-repeat;
            margin-right: 20px;
        }
        
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${c.logo}') center/contain no-repeat;
            margin-left: 20px;
        }

        /* Controle espec\xedfico para se\xe7\xe3o fotogr\xe1fica */
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
        
        /* P\xc1GINA FINAL */
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
            background: url('${c.logo}') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${c.line}') repeat-x;
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
            background: url('${c.line}') repeat-x;
            background-size: contain;
            z-index: 10;
        }
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
                break-inside: avoid;
                page-break-inside: avoid;
                /* padding j\xe1 est\xe1 aplicado */
            }
            
            /* Configura\xe7\xf5es espec\xedficas para quebra de p\xe1gina */
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
            
            /* Controle espec\xedfico para se\xe7\xe3o fotogr\xe1fica */
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
            <h1 class="cover-title">RELAT\xd3RIO DE <br> EVID\xcaNCIAS</h1>
            <div class="cover-date">${f}</div>
        </div>
    </div>
    
    <!-- P\xc1GINA DE SERVI\xc7O -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">${d}</div>
        <div class="service-period">${(0,i.kq)(a)}</div>
        <div class="service-subregion">${e}</div>
        <div class="service-footer-line"></div>
    </div>
    
    ${"MUTIRAO"!==a.tipoServico&&"fotos"in a&&a.fotos&&a.fotos.length>0?`
    ${(()=>{let b=a.fotos.sort((a,b)=>{let c=a.ordem||0,d=b.ordem||0;return c-d}),c=Math.ceil(b.length/3),d="";for(let f=0;f<c;f++){let c=3*f,h=c+3,j=b.slice(c,h),k=0===f;j.length>0&&(d+=`
          <!-- P\xc1GINA FOTOGR\xc1FICA ${f+1} -->
          <div class="page content-page">
            <div class="largura-fotografico"> 
           

              <div class="photo-header-with-logos">
                  <div class="prefeitura-logo"></div>
                  <div class="company-logo"></div>
              </div>
              
              ${k||"ACUMULADOR"===a.tipoServico||"ALAGAMENTOS"===a.tipoServico||"DDS"===a.tipoServico?`
              <div class="photo-descriptors">
                  <div class="descriptor-item">
                      <strong>PREFEITURA REGIONAL:</strong> ${e}
                  </div>
                  <div class="descriptor-item">
                      <strong>Servi\xe7o(s):</strong> ${"ACUMULADOR"===a.tipoServico?"A\xe7\xe3o Acumulador: Coleta e Limpeza":g.k4[a.tipoServico]}
                  </div>
                  ${"DDS"!==a.tipoServico?`
                  <div class="descriptor-item">
                      <strong>Local / Evento:</strong> ${"REVITALIZACAO"===a.tipoServico&&"local"in a?a.local:"endereco"in a?a.endereco:"N/A"}
                  </div>
                  `:""}
                  ${"REVITALIZACAO"===a.tipoServico?`
                  <div class="descriptor-item">
                      <strong>Frequ\xeancia:</strong> ${"frequencia"in a?a.frequencia:"N/A"}
                  </div>
                  <div class="descriptor-item">
                      <strong>Peso Coletado:</strong> ${"peso"in a&&"string"==typeof a.peso&&""!==a.peso.trim()?a.peso:"N/A"}
                  </div>
                  `:"DDS"!==a.tipoServico?`
                  <div class="descriptor-item">
                      <strong>Descri\xe7\xe3o:</strong> ${"descricao"in a?a.descricao:"N/A"}
                  </div>
                  `:""}
                  <div class="descriptor-item">
                      <strong>${"DDS"===a.tipoServico?"Per\xedodo:":"Per\xedodo/ Data:"}</strong> ${"dataInicio"in a&&"dataTermino"in a&&a.dataInicio&&a.dataTermino?(0,i.vy)(a.dataInicio,a.dataTermino):"data"in a&&a.data?(0,i.oh)(a.data):(0,i.oh)(new Date().toLocaleDateString("pt-BR"))}
                  </div>
              </div>
              `:""}
              
              <div class="photos-grid ${1===j.length?"one-photo":2===j.length?"two-photos":"three-photos"}">
                  ${j.map((a,b)=>`
                      <div class="photo-item">
                          <div class="photo-container">
                              <img src="${a.url}" alt="Foto ${c+b+1}" />
                          </div>
                          ${a.descricao||("etapa"in a?a.etapa:"")?`<div class="photo-description">${a.descricao||("etapa"in a?a.etapa:"")}</div>`:""}
                      </div>
                  `).join("")}
              </div>
            </div>

          </div>
          `)}return d})()}
    `:""}
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `}(a);await b.setContent(d,{waitUntil:"networkidle0"}),await new Promise(a=>setTimeout(a,2e3));let e=await b.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}});return new Uint8Array(e)}finally{await c.close()}}async function m(a,b){let c=await (0,f.p)(),d=await e.default.launch(c);try{let c=await d.newPage();await c.setViewport({width:1123,height:794});let e=function(a,b){let c=(0,h.E)(),d=a.reduce((a,b)=>(a[b.sub]||(a[b.sub]=[]),a[b.sub].push(b),a),{}),e=["CV","JT","MG","ST","SP"].filter(a=>d[a]);return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio Consolidado de Revitaliza\xe7\xf5es</title>
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
            background: url('${c.cover}') center/cover no-repeat;
            z-index: 1;
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
        
        /* P\xc1GINA DE SERVI\xc7O */
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
            background: url('${c.logo}') center/contain no-repeat;
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
            background: url('${c.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* SE\xc7\xc3O FOTOGR\xc1FICA */
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
            background: url('${c.prefeitura}') center/contain no-repeat;
        }
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${c.logo}') center/contain no-repeat;
        }
        .photo-descriptors {
            background: #fff !important;
            padding: 15px 20px 10px 20px;
            font-size: 12px;
            break-after: avoid;
            page-break-after: avoid;
            margin-bottom: 10px;
        }
       
        /* GRID DIN\xc2MICO PARA FOTOS */
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
        /* P\xc1GINA FINAL */
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
            background: url('${c.line}') no-repeat;
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
            background: url('${c.logo}') center/contain no-repeat;
            z-index: 5;
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
            <h1 class="cover-title">RELAT\xd3RIO DE <br> EVID\xcaNCIAS</h1>
            <div class="cover-date">S\xe3o Paulo, ${b}</div>
        </div>
    </div>
    
    <!-- CONTRA CAPA -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">RELAT\xd3RIO DE REVITALIZA\xc7\xc3O DE <br> PONTOS VICIADOS</div>
        <div class="service-subregion">EVID\xcaNCIAS CONSOLIDADAS</div>
        <div class="service-period">${b}</div>
        <div class="service-footer-line"></div>
    </div>
    
    ${e.map(a=>{let c=d[a],e=g.iU[a];return`
        <!-- CONTRA CAPA ${e} -->
        <div class="page service-page">
            <div class="service-logo"></div>
            <div class="service-title">REVITALIZA\xc7\xd5ES</div>
            <div class="service-subregion">${e}</div>
            <div class="service-period">${b}</div>
            <div class="service-footer-line"></div>
        </div>
        
        ${c.map(a=>{let b=a.fotos||[],c=b.length;return`
            <!-- SE\xc7\xc3O FOTOGR\xc1FICA - ${a.local} -->
            <div class="page content-page">
                <div class="largura-fotografico">
                    <div class="photo-header-with-logos">
                        <div class="prefeitura-logo"></div>
                        <div class="company-logo"></div>
                    </div>
                    
                    <div class="photo-descriptors">
                        <div class="descriptor-item">
                            <strong>PREFEITURA REGIONAL:</strong> ${e}
                        </div>
                        <div class="descriptor-item">
                            <strong>Servi\xe7o(s):</strong> Revitaliza\xe7\xe3o de Pontos Viciados
                        </div>
                        <div class="descriptor-item">
                            <strong>Local / Evento:</strong> ${a.local}
                        </div>
                        <div class="descriptor-item">
                            <strong>Frequ\xeancia:</strong> ${a.frequencia||"N/A"}
                        </div>
                        <div class="descriptor-item">
                            <strong>Peso Coletado:</strong> ${a.peso||"N/A"}
                        </div>
                        <div class="descriptor-item">
                            <strong>Per\xedodo/ Data:</strong> ${new Date(a.data).toLocaleDateString("pt-BR")}
                        </div>
                    </div>
                    
                    <div class="photos-grid ${1===c?"one-photo":2===c?"two-photos":"three-photos"}">
                        ${b.map(a=>`
                            <div class="photo-item">
                                <div class="photo-container">
                                    <img src="${a.url}" alt="${a.etapa}" />
                                </div>
                                ${a.descricao||a.etapa?`<div class="photo-description">${a.descricao||a.etapa}</div>`:""}
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
            `}).join("")}
        `}).join("")}
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `}(a,b);await c.setContent(e,{waitUntil:"networkidle0"}),await new Promise(a=>setTimeout(a,2e3));let f=await c.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}});return new Uint8Array(f)}finally{await d.close()}}[e,f]=j.then?(await j)():j,d()}catch(a){d(a)}})},47018:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{n:()=>i,p:()=>h});var e=c(8856),f=c(84387),g=a([e,f]);async function h(){return{headless:!0,args:[...f.default.args,"--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-accelerated-2d-canvas","--no-first-run","--no-zygote","--single-process","--disable-gpu","--disable-web-security","--disable-features=VizDisplayCompositor"],executablePath:await f.default.executablePath()}}async function i(a){let b=e.default,c=await b.launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]});try{let b=await c.newPage();await b.setViewport({width:1123,height:794}),await b.setContent(a,{waitUntil:"networkidle0",timeout:3e5}),await new Promise(a=>setTimeout(a,1e4));let d=await b.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}});return Buffer.from(d)}finally{await c.close()}}[e,f]=g.then?(await g)():g,d()}catch(a){d(a)}})}};