# Script PowerShell SIMPLES para desenvolvimento local

Write-Host "Iniciando backend de relatorios..." -ForegroundColor Green

# Verificar se Go esta instalado
try {
    $goVersion = go version
    Write-Host "Go encontrado: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "Go nao esta instalado!" -ForegroundColor Red
    Write-Host "Baixe em: https://golang.org/dl/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se Node.js esta instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao esta instalado!" -ForegroundColor Red
    Write-Host "Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependencias do Go
Write-Host "Instalando dependencias do Go..." -ForegroundColor Blue
go mod tidy

# Instalar Puppeteer globalmente
Write-Host "Instalando Puppeteer..." -ForegroundColor Blue
npm install -g puppeteer

# Copiar arquivo de ambiente se nao existir
if (!(Test-Path ".env")) {
    Write-Host "Copiando arquivo de ambiente..." -ForegroundColor Blue
    Copy-Item "env.example" ".env"
    Write-Host "IMPORTANTE: Edite o arquivo .env com suas configuracoes de banco!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Iniciando servidor backend..." -ForegroundColor Green
Write-Host "Servidor estara disponivel em: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Teste em: http://localhost:8080/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Certifique-se de que PostgreSQL esta rodando!" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
go run main.go
