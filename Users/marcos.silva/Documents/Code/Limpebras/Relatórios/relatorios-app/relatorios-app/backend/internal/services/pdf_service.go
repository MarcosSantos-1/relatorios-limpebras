package services

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"relatorios-backend/internal/models"
)

type PDFService struct {
	tempDir string
}

func NewPDFService() *PDFService {
	tempDir := os.Getenv("TEMP_DIR")
	if tempDir == "" {
		tempDir = "C:\\temp"
	}
	// Garantir que o caminho está correto
	tempDir = strings.ReplaceAll(tempDir, "\\", "/")
	return &PDFService{tempDir: tempDir}
}

// HTML template para relatórios
const relatorioTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de {{.TipoServico}}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 1;
        }
        
        .cover-logo {
            position: absolute;
            top: -90px;
            right: 80px;
            width: 330px;
            height: 330px;
            background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzMwIiBoZWlnaHQ9IjMzMCIgdmlld0JveD0iMCAwIDMzMCAzMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMzMwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjE2NSIgeT0iMTY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDMwNmIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MT0dPPC90ZXh0Pgo8L3N2Zz4K') center/contain no-repeat;
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
            background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDI4MCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMjgwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMwMDMwNmIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MT0dPPC90ZXh0Pgo8L3N2Zz4K') center/contain no-repeat;
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
            background: linear-gradient(90deg, #00306b 0%, #667eea 50%, #00306b 100%);
            z-index: 10;
        }
        
        /* PÁGINA DE CONTEÚDO */
        .content-page {
            min-height: 210mm;
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
        
        /* GRID DE FOTOS */
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
            background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMwMDMwNmIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MT0dPPC90ZXh0Pgo8L3N2Zz4K') center/contain no-repeat;
            margin-bottom: 50px;
        }
        
        .final-top-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(90deg, #00306b 0%, #667eea 50%, #00306b 100%);
            z-index: 10;
        }
        
        .final-bottom-line {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(90deg, #00306b 0%, #667eea 50%, #00306b 100%);
            z-index: 10;
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
            <div class="cover-date">{{.DataFormatada}}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE SERVIÇO -->
    <div class="page service-page">
        <div class="service-logo"></div>
        <div class="service-title">{{.TituloServico}}</div>
        <div class="service-period">{{.Periodo}}</div>
        <div class="service-subregion">{{.SubRegiao}}</div>
        <div class="service-footer-line"></div>
    </div>
    
    {{if .Fotos}}
    {{range $index, $foto := .Fotos}}
    <!-- PÁGINA FOTOGRÁFICA {{add $index 1}} -->
    <div class="page content-page">
        <div class="content-info">
            <h3>Informações do Relatório</h3>
            <p><strong>Título:</strong> {{$.Title}}</p>
            <p><strong>Tipo de Serviço:</strong> {{$.TipoServico}}</p>
            <p><strong>Sub-região:</strong> {{$.SubRegiao}}</p>
            {{if $.Local}}<p><strong>Local:</strong> {{$.Local}}</p>{{end}}
            {{if $.Endereco}}<p><strong>Endereço:</strong> {{$.Endereco}}</p>{{end}}
            {{if $.Descricao}}<p><strong>Descrição:</strong> {{$.Descricao}}</p>{{end}}
            <p><strong>Data:</strong> {{$.DataFormatada}}</p>
        </div>
        
        <div class="photos-grid three-photos">
            <div class="photo-item">
                <div class="photo-container">
                    <img src="{{$foto.URL}}" alt="Foto {{add $index 1}}" />
                </div>
                {{if $foto.Descricao}}<div class="photo-description">{{$foto.Descricao}}</div>{{end}}
            </div>
        </div>
    </div>
    {{end}}
    {{end}}
    
    <!-- PÁGINA FINAL -->
    <div class="page final-page">
        <div class="final-top-line"></div>
        <div class="final-logo"></div>
        <div class="final-bottom-line"></div>
    </div>
</body>
</html>
`

func (s *PDFService) GeneratePDF(relatorio *models.Relatorio) ([]byte, error) {
	// Preparar dados para o template
	data := map[string]interface{}{
		"Title":         relatorio.Title,
		"TipoServico":  relatorio.TipoServico,
		"TituloServico": s.getServiceTitle(relatorio.TipoServico),
		"SubRegiao":    s.getSubRegion(relatorio.Sub),
		"Local":        relatorio.Local,
		"Endereco":     relatorio.Endereco,
		"Descricao":    relatorio.Descricao,
		"DataFormatada": s.formatDate(relatorio.Data),
		"Periodo":      s.formatPeriod(relatorio),
		"Fotos":        relatorio.Fotos,
	}

	// Criar template
	tmpl, err := template.New("relatorio").Funcs(template.FuncMap{
		"add": func(a, b int) int { return a + b },
	}).Parse(relatorioTemplate)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar template: %w", err)
	}

	// Executar template
	var html bytes.Buffer
	if err := tmpl.Execute(&html, data); err != nil {
		return nil, fmt.Errorf("erro ao executar template: %w", err)
	}

	// Salvar HTML temporário
	fileName := fmt.Sprintf("relatorio_%s_%d.html", relatorio.ID, time.Now().Unix())
	htmlFile := s.tempDir + "/" + fileName
	if err := os.WriteFile(htmlFile, html.Bytes(), 0644); err != nil {
		return nil, fmt.Errorf("erro ao salvar HTML temporário: %w", err)
	}
	defer os.Remove(htmlFile)

	// Gerar PDF usando Puppeteer via Node.js
	pdfFileName := fmt.Sprintf("relatorio_%s_%d.pdf", relatorio.ID, time.Now().Unix())
	pdfFile := s.tempDir + "/" + pdfFileName
	defer os.Remove(pdfFile)

	// Script Node.js para gerar PDF
	script := fmt.Sprintf(`
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Puppeteer...');
  
  try {
    console.log('📦 Lançando navegador...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    console.log('✅ Navegador lançado');
    
    const page = await browser.newPage();
    console.log('📄 Página criada');
    
    await page.setViewport({ width: 1123, height: 794 });
    console.log('📐 Viewport definido');
    
    console.log('📖 Lendo arquivo HTML: %s');
    const htmlPath = '%s';
    console.log('📁 Caminho do HTML:', htmlPath);
    const html = fs.readFileSync(htmlPath, 'utf8');
    console.log('📝 HTML lido, tamanho:', html.length, 'caracteres');
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('📄 Conteúdo carregado na página');
    
    console.log('⏳ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📄 Gerando PDF...');
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
    
    console.log('💾 Salvando PDF: %s');
    fs.writeFileSync('%s', pdf);
    console.log('✅ PDF salvo com sucesso! Tamanho:', pdf.length, 'bytes');
    
    await browser.close();
    console.log('🔚 Navegador fechado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
`, htmlFile, htmlFile, pdfFile, pdfFile)

	// Salvar script temporário
	scriptFileName := fmt.Sprintf("generate_pdf_%d.js", time.Now().Unix())
	scriptFile := s.tempDir + "/" + scriptFileName
	if err := os.WriteFile(scriptFile, []byte(script), 0644); err != nil {
		return nil, fmt.Errorf("erro ao salvar script temporário: %w", err)
	}
	defer os.Remove(scriptFile)

	// Executar script Node.js
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Tentar diferentes caminhos para o Node.js
	nodePaths := []string{"node", "C:\\Program Files\\nodejs\\node.exe", "C:\\Program Files (x86)\\nodejs\\node.exe"}
	var cmd *exec.Cmd
	var nodePath string
	
	for _, path := range nodePaths {
		if _, err := exec.LookPath(path); err == nil {
			nodePath = path
			cmd = exec.CommandContext(ctx, path, scriptFile)
			break
		}
	}
	
	if cmd == nil {
		return nil, fmt.Errorf("Node.js não encontrado no sistema. Caminhos testados: %v", nodePaths)
	}

	// Capturar stdout e stderr para debug
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	fmt.Printf("Executando Puppeteer com Node.js: %s\n", nodePath)
	fmt.Printf("Script: %s\n", scriptFile)
	fmt.Printf("HTML: %s\n", htmlFile)
	fmt.Printf("PDF: %s\n", pdfFile)

	if err := cmd.Run(); err != nil {
		fmt.Printf("Erro stdout: %s\n", stdout.String())
		fmt.Printf("Erro stderr: %s\n", stderr.String())
		return nil, fmt.Errorf("erro ao executar Puppeteer: %w\nStdout: %s\nStderr: %s", err, stdout.String(), stderr.String())
	}

	fmt.Printf("Puppeteer executado com sucesso!\n")
	fmt.Printf("Stdout: %s\n", stdout.String())

	// Ler PDF gerado
	pdfBytes, err := os.ReadFile(pdfFile)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler PDF gerado: %w", err)
	}

	return pdfBytes, nil
}

func (s *PDFService) getServiceTitle(tipoServico string) string {
	titles := map[string]string{
		"MUTIRAO":        "RELATÓRIO OPERAÇÃO SÃO PAULO LIMPA",
		"REVITALIZACAO":  "RELATÓRIO DE REVITALIZAÇÃO",
		"ACUMULADOR":     "RELATÓRIO DE AÇÃO ACUMULADOR",
		"ALAGAMENTOS":    "RELATÓRIO DE LIMPEZA PÓS ALAGAMENTO",
		"ZELADORIA":      "RELATÓRIO DE ZELADORIA",
		"DDS":            "DDS",
		"HIGIENIZACAO":   "RELATÓRIO DE HIGIENIZAÇÃO",
		"VARRICAO_MECANIZADA": "RELATÓRIO DE VARRICAO MECANIZADA",
		"FEIRAS":         "RELATÓRIO DE FEIRAS",
		"EVENTOS":        "RELATÓRIO DE EVENTOS",
		"ROTINEIROS":     "RELATÓRIO DE SERVIÇOS ROTINEIROS",
	}
	if title, exists := titles[tipoServico]; exists {
		return title
	}
	return "RELATÓRIO DE SERVIÇO"
}

func (s *PDFService) getSubRegion(sub string) string {
	regions := map[string]string{
		"SP": "SÃO PAULO",
		"CV": "CASA VERDE / LIMÃO / CACHOEIRINHA",
		"JT": "JAÇANÃ / TREMEMBÉ",
		"MG": "VILA MARIA / VILA GUILHERME",
		"ST": "SANTANA / TUCURUVI",
	}
	if region, exists := regions[sub]; exists {
		return region
	}
	return sub
}

func (s *PDFService) formatDate(date string) string {
	if date == "" {
		return time.Now().Format("02/01/2006")
	}
	
	// Tentar parsear diferentes formatos de data
	formats := []string{
		"2006-01-02",
		"02/01/2006",
		"2006-01-02T15:04:05Z",
	}
	
	for _, format := range formats {
		if t, err := time.Parse(format, date); err == nil {
			return t.Format("02/01/2006")
		}
	}
	
	return date
}

func (s *PDFService) formatPeriod(relatorio *models.Relatorio) string {
	if relatorio.DataInicio != "" && relatorio.DataTermino != "" {
		if relatorio.DataInicio == relatorio.DataTermino {
			return s.formatDate(relatorio.DataInicio)
		}
		return fmt.Sprintf("%s a %s", s.formatDate(relatorio.DataInicio), s.formatDate(relatorio.DataTermino))
	}
	if relatorio.Data != "" {
		return s.formatDate(relatorio.Data)
	}
	return s.formatDate(time.Now().Format("2006-01-02"))
}
