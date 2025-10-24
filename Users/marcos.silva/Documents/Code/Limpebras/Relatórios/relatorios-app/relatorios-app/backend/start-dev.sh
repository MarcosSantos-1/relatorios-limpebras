#!/bin/bash

# Script para desenvolvimento local do backend

echo "🚀 Iniciando backend de relatórios..."

# Verificar se Go está instalado
if ! command -v go &> /dev/null; then
    echo "❌ Go não está instalado. Por favor, instale Go 1.21 ou superior."
    exit 1
fi

# Verificar se Node.js está instalado (necessário para Puppeteer)
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js para usar Puppeteer."
    exit 1
fi

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL não está rodando. Iniciando com Docker..."
    docker-compose up -d postgres
    sleep 5
fi

# Instalar dependências do Go
echo "📦 Instalando dependências do Go..."
go mod tidy

# Instalar Puppeteer globalmente
echo "📦 Instalando Puppeteer..."
npm install -g puppeteer

# Copiar arquivo de ambiente se não existir
if [ ! -f .env ]; then
    echo "📋 Copiando arquivo de ambiente..."
    cp env.example .env
fi

# Executar migrações (será feito automaticamente pelo app)

# Iniciar servidor
echo "🎯 Iniciando servidor backend..."
go run main.go
