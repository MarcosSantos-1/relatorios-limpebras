#!/bin/bash

# Script de Deploy para Render.com
# Este script é executado automaticamente pelo Render

echo "🚀 Iniciando deploy do Sistema de Relatórios Limpebras..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

# Build do frontend
echo "🔨 Fazendo build do frontend..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build do frontend concluído com sucesso!"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi

# Verificar se o backend existe
if [ -d "backend" ]; then
    echo "🔧 Configurando backend..."
    cd backend
    
    # Instalar dependências do Go
    echo "📦 Instalando dependências do Go..."
    go mod tidy
    
    # Build do backend
    echo "🔨 Fazendo build do backend..."
    go build -o main .
    
    if [ $? -eq 0 ]; then
        echo "✅ Build do backend concluído com sucesso!"
    else
        echo "❌ Erro no build do backend"
        exit 1
    fi
    
    cd ..
fi

echo "🎉 Deploy concluído com sucesso!"
echo "📋 Próximos passos:"
echo "   1. Configure as variáveis de ambiente no Render"
echo "   2. Configure o banco PostgreSQL (Neon recomendado)"
echo "   3. Teste o sistema de login"
echo "   4. Configure o storage para uploads (se necessário)"
