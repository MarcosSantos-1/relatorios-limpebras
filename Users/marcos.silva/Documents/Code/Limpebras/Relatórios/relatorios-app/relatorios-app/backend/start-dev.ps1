# Script PowerShell para desenvolvimento local do backend

Write-Host "🚀 Iniciando backend de relatórios..." -ForegroundColor Green

# Verificar se Go está instalado
try {
    $goVersion = go version
    Write-Host "✅ Go encontrado: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go não está instalado. Por favor, instale Go 1.21 ou superior." -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não está instalado. Por favor, instale Node.js para usar Puppeteer." -ForegroundColor Red
    exit 1
}

# Verificar se Docker está disponível
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker não encontrado. Certifique-se de que PostgreSQL está rodando localmente." -ForegroundColor Yellow
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
}

# Iniciar servidor
Write-Host "🎯 Iniciando servidor backend..." -ForegroundColor Green
Write-Host "Servidor estará disponível em: http://localhost:8080" -ForegroundColor Cyan
go run main.go
