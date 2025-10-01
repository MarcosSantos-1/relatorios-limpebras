"use strict";(()=>{var a={};a.id=474,a.ids=[474],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8856:a=>{a.exports=import("puppeteer-core")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{a.exports=require("path")},37134:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{POST:()=>n});var e=c(10641),f=c(16897),g=c(42395),h=c(16312),i=c(80805),j=c(58848),k=c(86012),l=c(47018),m=a([f,g,h,j,l]);async function n(a){try{let b,c,{tipo:d,dados:m,consolidated:n}=await a.json();if(console.log("\uD83D\uDCCA PDF Request:",{tipo:d,dados:m?.tipoServico,consolidated:n}),!d||!m)return console.error("❌ Valida\xe7\xe3o falhou:",{tipo:d,dados:!!m}),e.NextResponse.json({error:"Tipo e dados s\xe3o obrigat\xf3rios"},{status:400});switch(d){case"mutirao":console.log("\uD83D\uDD04 Processando mutir\xe3o..."),b=await (0,f.SP)(m),c=n?(0,k.gh)(m.data):(0,k.hP)(m);break;case"registro":console.log("\uD83D\uDD04 Processando registro..."),b=await (0,f.YF)(m),c=(0,k.hP)(m);break;case"evidencias":console.log("\uD83D\uDD04 Processando evid\xeancias...",m.tipoServico),b=await (0,g.G)(m),c=(0,k.hP)(m);break;case"eventos":console.log("\uD83D\uDD04 Processando eventos...",m.tipoServico),b=await (0,g.h)(m),c=(0,k.hP)(m);break;case"unified":console.log("\uD83D\uDD04 Processando unificado..."),b=await (0,h.F5)(m),c=(0,k.hP)(m);break;case"monumentos":console.log("\uD83D\uDD04 Processando monumentos...");let o=(0,i.i)(m);b=await (0,l.n)(o),c=(0,k.hP)(m);break;case"rotineiros":console.log("\uD83D\uDD04 Processando servi\xe7os rotineiros..."),console.log("\uD83D\uDCCA Dados recebidos:",JSON.stringify(m,null,2));let p=new Date(m.data).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});console.log("\uD83D\uDCC5 Data formatada:",p),console.log("\uD83D\uDCCB Array de rotineiros:",[m]),b=await (0,j.g)(p,[m]),c=(0,k.hP)(m),console.log("\uD83D\uDCC4 Nome do arquivo:",c);break;default:return console.error("❌ Tipo inv\xe1lido:",d),e.NextResponse.json({error:"Tipo de relat\xf3rio inv\xe1lido"},{status:400})}return new e.NextResponse(new Uint8Array(b),{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(c)}.pdf`}})}catch(a){return console.error("❌ Erro ao gerar PDF:",a),console.error("❌ Stack trace:",a instanceof Error?a.stack:"No stack trace"),e.NextResponse.json({error:"Erro interno do servidor ao gerar PDF",details:a instanceof Error?a.message:String(a)},{status:500})}}[f,g,h,j,l]=m.then?(await m)():m,d()}catch(a){d(a)}})},42395:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{G:()=>l,h:()=>m});var e=c(8856),f=c(47018),g=c(43344),h=c(53189),i=c(95012),j=a([e,f]);function k(a){if(!a)return"S\xe3o Paulo, Data n\xe3o informada";let b=new Date(a);if(isNaN(b.getTime()))return"S\xe3o Paulo, Data n\xe3o informada";let c=b.toLocaleDateString("pt-BR",{month:"long"}),d=b.getFullYear();return`S\xe3o Paulo, ${c.charAt(0).toUpperCase()+c.slice(1)} de ${d}`}async function l(a){console.log("\uD83D\uDD04 Iniciando exportEvidenciasPdf para:",a.tipoServico);let b=await (0,f.p)(),c=e.default,d=await c.launch(b);try{let b=await d.newPage();await b.setViewport({width:1123,height:794}),await b.setDefaultTimeout(3e4);let c=function(a){let b=(0,h.E)();return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio de Evid\xeancias</title>
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
            /* As margens s\xe3o controladas pelo padding agora */
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
            height: 100vh; /* Altura total da viewport - AJUSTE PARA EVITAR QUEBRA DE P\xc1GINA */
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
            background: url('${b.cover}') center/cover no-repeat;
            z-index: 1;
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
            padding: 30px 60px 30px 30px; /* Garante padding */
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
            bottom: -53px;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${b.line}') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }
        
        /* P\xc1GINA DE RESUMO */
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
        
        /* P\xc1GINA DE SUB-REGI\xc3O */
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
        
        /* P\xc1GINA DE CONTE\xdaDO */
        .content-page {
            min-height: calc(210mm - 0px);
            padding: 40px 60px 40px 30px;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        /* CABE\xc7ALHO DA P\xc1GINA FOTOGR\xc1FICA */
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
            background: url('${b.logo}') center/contain no-repeat;
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
        
        /* CABE\xc7ALHO COM LOGOS PARA P\xc1GINAS FOTOGR\xc1FICAS */
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
            background: url('${b.prefeitura}') center/contain no-repeat;
        }
        
        .photo-header .company-logo {
            position: absolute;
            right: 20px;
            top: 30px;
            transform: translateY(-50%);
            width: 120px;
            height: 100px;
            background: url('${b.logo}') center/contain no-repeat;
        }  
            
        
        /* GRID DE FOTOS DIN\xc2MICO */
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
            /* Ajuste para garantir que a altura m\xe1xima n\xe3o ultrapasse a p\xe1gina */
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
        }
        
        /* ALTURA UNIFICADA PARA TODAS AS FOTOS - SEM QUEBRA DE P\xc1GINA */
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
            background: url('${b.logo}') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: url('${b.line}') repeat-x;
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
            background: url('${b.line}') repeat-x;
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
            <h1 class="cover-title">RELAT\xd3RIO DE EVID\xcaNCIAS</h1>
             <div class="cover-date">${k("DDS"===a.tipoServico?a.dataInicio:"data"in a?a.data:a.dataInicio)}</div>
        </div>
    </div>
    
    
    <!-- P\xc1GINA DE SERVI\xc7O -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">${g.mN[a.tipoServico]}</div>
        <div class="service-period">${(0,i.kq)(a)}</div>
        <div class="service-subregion">     <h2>EVID\xcaNCIAS CONSOLIDADAS</h2>
</div>
        <div class="final-bottom-line"></div>
    </div>
    
    ${(()=>{let b=[];if("fotos"in a&&a.fotos)if("DDS"===a.tipoServico){let c=a.fotos.reduce((a,b)=>{let c=b.descricao||"Sem descri\xe7\xe3o";return a[c]||(a[c]=[]),a[c].push(b),a},{});b=Object.values(c).flat()}else b=a.fotos.sort((a,b)=>{let c=a.ordem||0,d=b.ordem||0;return c-d});if(0===b.length)return"";let c=Math.ceil(b.length/3),d="";for(let e=0;e<c;e++){let c=3*e,f=c+3,h=b.slice(c,f),i=0===e;h.length>0&&(d+=`
          <!-- P\xc1GINA FOTOGR\xc1FICA ${e+1} -->
          <div class="page content-page">
        <div class="photo-header">
            <div class="prefeitura-logo"></div>
            <div class="company-logo"></div>
        </div>
              
              ${i||"ACUMULADOR"===a.tipoServico||"ALAGAMENTOS"===a.tipoServico||"DDS"===a.tipoServico?`
              <div class="photo-descriptors">
                  <div class="descriptor-item">
                      <strong>PREFEITURA REGIONAL:</strong> ${g.iU["sub"in a?a.sub:"secoes"in a?a.secoes[0].sub:"SP"]||("sub"in a?a.sub:"secoes"in a?a.secoes[0].sub:"SP")}
                  </div>
                  <div class="descriptor-item">
                      <strong>Servi\xe7o(s):</strong> ${g.k4[a.tipoServico]}
                  </div>
                  ${"DDS"!==a.tipoServico?`
                  <div class="descriptor-item">
                      <strong>Local / Evento:</strong> ${"local"in a?a.local:"endereco"in a?a.endereco:"N/A"}
                  </div>
                  ${"REVITALIZACAO"===a.tipoServico?`
                  <div class="descriptor-item">
                      <strong>Peso:</strong> ${"peso"in a?a.peso:"N/A"}
                  </div>
                  <div class="descriptor-item">
                      <strong>Frequ\xeancia:</strong> ${"frequencia"in a?a.frequencia:"N/A"}
                  </div>
                  `:`
                  <div class="descriptor-item">
                      <strong>Descri\xe7\xe3o:</strong> ${"descricao"in a?a.descricao:"N/A"}
                  </div>
                  `}
                  `:""}
                  <div class="descriptor-item">
                      <strong>Per\xedodo/ Data:</strong> ${(()=>{let b="dataInicio"in a&&a.dataInicio?a.dataInicio:"data"in a&&a.data?a.data:null,c="dataFim"in a&&a.dataFim?a.dataFim:null;if(b&&c&&b!==c){let a=new Date(b+"T00:00:00"),d=new Date(c+"T00:00:00");return`${a.toLocaleDateString("pt-BR")} a ${d.toLocaleDateString("pt-BR")}`}if(b){let a=new Date(b+"T00:00:00");return`${a.toLocaleDateString("pt-BR")} a ${a.toLocaleDateString("pt-BR")}`}return"Data n\xe3o informada"})()}
                  </div>
              </div>
              `:""}
              
              <div class="photos-grid ${1===h.length?"one-photo":2===h.length?"two-photos":"three-photos"}">
                  ${h.map((a,b)=>`
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
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `}(a);console.log("\uD83D\uDCC4 HTML gerado, tamanho:",c.length),await b.setContent(c,{waitUntil:"domcontentloaded"}),console.log("\uD83D\uDCC4 Conte\xfado carregado");try{await b.waitForFunction(()=>{let a=document.querySelectorAll("img");return Array.from(a).every(a=>a.complete)},{timeout:3e5}),console.log("✅ Todas as imagens carregadas")}catch(a){console.warn("⚠️ Timeout no carregamento de imagens, continuando...")}await new Promise(a=>setTimeout(a,3e3)),console.log("\uD83D\uDD04 Gerando PDF...");let e=await b.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:0,right:0,bottom:0,left:0}});return console.log("✅ PDF gerado com sucesso, tamanho:",e.length),new Uint8Array(e)}catch(a){throw console.error("❌ Erro na exportEvidenciasPdf:",a),a}finally{await d.close(),console.log("\uD83D\uDD12 Browser fechado")}}async function m(a){console.log("\uD83C\uDFAF Iniciando exportEventosPdf para:",a.tipoServico);let b=await (0,f.p)(),c=e.default,d=await c.launch(b);try{let b=await d.newPage();await b.setViewport({width:1123,height:794}),await b.setDefaultTimeout(3e4);let c=function(a){let b=(0,h.E)();return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio de Eventos</title>
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
        
        /* P\xe1gina de conte\xfado */
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
        <h1>RELAT\xd3RIO DE EVENTOS</h1>
        <h2>${a.sub}</h2>
        <div class="date">${k(a.dataInicio||a.data)}</div>
        <img src="${b.logo}" alt="Logo" class="logo">
    </div>
    
    <!-- Contra capa -->
    <div class="page back-cover">
        <h1>EVENTO</h1>
    </div>
    
    <!-- P\xe1gina de conte\xfado -->
    <div class="page content-page">
        <h1>EVENTO</h1>
        
        <div class="info-grid">
            <div class="info-item">
                <h3>Per\xedodo</h3>
                <p>${(0,i.kq)(a)}</p>
            </div>
            <div class="info-item">
                <h3>Sub-regi\xe3o</h3>
                <p>${a.sub}</p>
            </div>
            <div class="info-item">
                <h3>Local</h3>
                <p>${a.local||"N\xe3o informado"}</p>
            </div>
            <div class="info-item">
                <h3>Nome do Evento</h3>
                <p>${a.nomeEvento||"N\xe3o informado"}</p>
            </div>
        </div>
        
        ${a.descricao?`
        <div class="description">
            <h3>Descri\xe7\xe3o</h3>
            <p>${a.descricao}</p>
        </div>
        `:""}
        
        ${a.fotos&&a.fotos.length>0?`
        <div class="photos-grid">
            ${a.fotos.map(b=>`
                <div class="photo-item">
                    <img src="${b.url}" alt="Foto do evento">
                    <div class="photo-caption">${a.nomeEvento||"Evento"}</div>
                </div>
            `).join("")}
        </div>
        `:`
        <div class="no-photos">
            Nenhuma foto dispon\xedvel para este evento.
        </div>
        `}
    </div>
</body>
</html>`}(a);console.log("\uD83D\uDCC4 HTML gerado, tamanho:",c.length),await b.setContent(c,{waitUntil:"domcontentloaded"}),console.log("\uD83D\uDCC4 Conte\xfado carregado");try{await b.waitForFunction(()=>{let a=document.querySelectorAll("img");return Array.from(a).every(a=>a.complete)},{timeout:3e5}),console.log("✅ Todas as imagens carregadas")}catch(a){console.warn("⚠️ Timeout no carregamento de imagens, continuando...")}await new Promise(a=>setTimeout(a,3e3)),console.log("\uD83D\uDD04 Gerando PDF...");let e=await b.pdf({format:"A4",landscape:!0,printBackground:!0,margin:{top:0,right:0,bottom:0,left:0}});return console.log("✅ PDF gerado com sucesso, tamanho:",e.length),new Uint8Array(e)}catch(a){throw console.error("❌ Erro na exportEventosPdf:",a),a}finally{await d.close(),console.log("\uD83D\uDD12 Browser fechado")}}[e,f]=j.then?(await j)():j,d()}catch(a){d(a)}})},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},80805:(a,b,c)=>{c.d(b,{i:()=>f});var d=c(95012),e=c(53189);function f(a){let b=(0,e.E)(),c=(0,d.o3)(a.data);return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio de Monumentos - ${a.monumento}</title>
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
            background: url('${b.cover}') center/cover no-repeat;
            z-index: 1;
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
            background: url('${b.line}') no-repeat;
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
        
        /* GRID DE FOTOS DIN\xc2MICO PARA MONUMENTOS - REFATORADO */
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
            background: url('${b.logo}') center/contain no-repeat;
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
            background: url('${b.prefeitura}') center/contain no-repeat;
            margin-right: 20px;
        }
        
        .company-logo {
            width: 120px;
            height: 120px;
            background: url('${b.logo}') center/contain no-repeat;
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
            background: url('${b.logo}') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: url('${b.line}') no-repeat;
            background-size: 100% 100%;
        }
        
        .final-bottom-line {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: url('${b.line}') no-repeat;
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
            <h1 class="cover-title">Relat\xf3rio de Monumentos</h1>
            <h2 class="cover-subtitle">Limpeza e Conserva\xe7\xe3o de Monumentos P\xfablicos</h2>
            
            <div class="cover-info">
                <h3>Informa\xe7\xf5es do Servi\xe7o</h3>
                <p><strong>Monumento:</strong> ${a.monumento}</p>
                <p><strong>Local:</strong> ${a.local}</p>
                <p><strong>Setor:</strong> ${a.setorSelecionado}</p>
                <p><strong>Sub-regi\xe3o:</strong> ${g(a.sub)}</p>
            </div>
            
            <div class="cover-date">
                ${c}
            </div>
        </div>
    </div>
    
    <!-- CONTRA CAPA -->
    <div class="page service-page">
        <div class="service-content">
            <h1 class="service-title">Detalhes do Servi\xe7o</h1>
            
            <div class="service-period">
                <strong>Data:</strong> ${(0,d.oh)(a.data)}
            </div>
            
            <div class="service-subregion">
                <strong>Sub-regi\xe3o:</strong> ${g(a.sub)}
            </div>
            
            <div style="font-size: 18px; color: #2c3e50; line-height: 1.6;">
                <p><strong>Assunto:</strong> ${a.assunto}</p>
                <p><strong>Setor:</strong> ${a.setorSelecionado}</p>
                <p><strong>Monumento:</strong> ${a.monumento}</p>
                <p><strong>Local Atendido:</strong> ${a.local}</p>
                ${a.descricao?`<p><strong>Descri\xe7\xe3o:</strong> ${a.descricao}</p>`:""}
            </div>
        </div>
        <div class="service-footer-line"></div>
    </div>
    
    ${a.fotos.length>0?`
    ${(()=>{let b=a.fotos.sort((a,b)=>(a.ordem||0)-(b.ordem||0)),c=Math.ceil(b.length/3),d="";for(let e=0;e<c;e++){let c=3*e,f=c+3,h=b.slice(c,f);d+=`
        <!-- SE\xc7\xc3O FOTOGR\xc1FICA - ${a.monumento} -->
        <div class="page content-page">
            <div class="largura-fotografico">
                <div class="photo-header-with-logos">
                    <div class="prefeitura-logo"></div>
                    <h2>Relat\xf3rio Fotogr\xe1fico</h2>
                    <div class="company-logo"></div>
                </div>
                
                <div class="photo-descriptors">
                    <div class="descriptor-item">
                        <strong>PREFEITURA REGIONAL:</strong> ${g(a.sub)}
                    </div>
                    <div class="descriptor-item">
                        <strong>Servi\xe7o(s):</strong> Limpeza e Conserva\xe7\xe3o de Monumentos P\xfablicos
                    </div>
                    <div class="descriptor-item">
                        <strong>Local / Evento:</strong> ${a.local}
                    </div>
                    <div class="descriptor-item">
                        <strong>Monumento:</strong> ${a.monumento}
                    </div>
                    <div class="descriptor-item">
                        <strong>Setor:</strong> ${a.setorSelecionado}
                    </div>
                    <div class="descriptor-item">
                        <strong>Per\xedodo/ Data:</strong> ${new Date(a.data).toLocaleDateString("pt-BR")}
                    </div>
                </div>
                
                <div class="photos-grid ${1===h.length?"one-photo":2===h.length?"two-photos":"three-photos"}">
                    ${h.map((a,b)=>`
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
        `}return d})()}
    `:""}
    
    <!-- P\xc1GINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
  `}function g(a){return({CV:"Casa Verde / Lim\xe3o / Cachoeirinha",JT:"Ja\xe7an\xe3 / Trememb\xe9",MG:"Vila Maria / Vila Guilherme",ST:"Santana / Tucuruvi",SP:"S\xe3o Paulo"})[a]||a}},84387:a=>{a.exports=import("@sparticuz/chromium-min")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},90913:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>x,patchFetch:()=>w,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(37134),v=a([u]);u=(v.then?(await v)():v)[0];let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/generate-pdf/route",pathname:"/api/generate-pdf",filename:"route",bundlePath:"app/api/generate-pdf/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/marcos/Desktop/relatorios-backend/app/api/generate-pdf/route.ts",nextConfigOutput:"",userland:u}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function w(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function x(a,b,c){var d;let e="/api/generate-pdf/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G=D,G="/index"===G?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[586,692,890,312,86],()=>b(b.s=90913));module.exports=c})();