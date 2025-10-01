#!/bin/bash

echo "🚀 Configurando Sistema de Relatórios - Backend Node.js"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se PostgreSQL está disponível
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL não encontrado. Certifique-se de que está instalado e rodando."
    echo "   Você pode usar Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
fi

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend

if [ ! -f package.json ]; then
    echo "❌ package.json não encontrado no diretório backend"
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

echo "✅ Dependências do backend instaladas"

# Configurar arquivo .env
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis conforme necessário."
else
    echo "✅ Arquivo .env já existe"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p uploads
mkdir -p generated-pdfs
mkdir -p logs
echo "✅ Diretórios criados"

# Executar migrações do banco
echo "🗄️  Executando migrações do banco de dados..."
if command -v psql &> /dev/null; then
    # Tentar executar migrações se PostgreSQL estiver disponível
    echo "   Executando: node migrations/migrate.js"
    node migrations/migrate.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrações executadas com sucesso"
    else
        echo "⚠️  Erro ao executar migrações. Configure o banco de dados manualmente."
    fi
else
    echo "⚠️  PostgreSQL não disponível. Execute as migrações manualmente depois."
fi

# Voltar para o diretório raiz
cd ..

echo ""
echo "🎉 Setup do backend concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis no arquivo backend/.env"
echo "2. Certifique-se de que o PostgreSQL está rodando"
echo "3. Execute: cd backend && npm run dev"
echo ""
echo "🔧 Comandos úteis:"
echo "   npm run dev     - Executar em modo desenvolvimento"
echo "   npm start       - Executar em modo produção"
echo "   npm run migrate - Executar migrações do banco"
echo ""
echo "📚 Documentação:"
echo "   - Backend API: http://localhost:3001/api"
echo "   - Health check: http://localhost:3001/health"
echo "   - Deploy guide: DEPLOY-BACKEND.md"
echo ""
echo "🚀 Para deploy em produção, consulte DEPLOY-BACKEND.md"
