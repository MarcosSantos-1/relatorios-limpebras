# Script PowerShell SIMPLES para desenvolvimento local (SEM DOCKER)

Write-Host "🚀 Iniciando backend de relatórios..." -ForegroundColor Green

# Verificar se Go está instalado
try {
    $goVersion = go version
    Write-Host "✅ Go encontrado: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go não está instalado!" -ForegroundColor Red
    Write-Host "📥 Baixe em: https://golang.org/dl/" -ForegroundColor Yellow
    Write-Host "⏸️  Pressione qualquer tecla para sair..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não está instalado!" -ForegroundColor Red
    Write-Host "📥 Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "⏸️  Pressione qualquer tecla para sair..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Instalar dependências do Go
Write-Host "📦 Instalando dependências do Go..." -ForegroundColor Blue
go mod tidy

# Instalar Puppeteer globalmente
Write-Host "📦 Instalando Puppeteer..." -ForegroundColor Blue
npm install -g puppeteer

# Copiar arquivo de ambiente se não existir
if (!(Test-Path ".env")) {
    Write-Host "📋 Copiando arquivo de ambiente..." -ForegroundColor Blue
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações de banco!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Iniciando servidor backend..." -ForegroundColor Green
Write-Host "🌐 Servidor estará disponível em: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔍 Teste em: http://localhost:8080/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Certifique-se de que PostgreSQL está rodando!" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
go run main.go
