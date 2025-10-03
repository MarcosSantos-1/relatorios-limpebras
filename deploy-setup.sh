#!/bin/bash

# 🚀 Script de Deploy Automatizado - Sistema de Relatórios
# Este script ajuda a configurar o deploy completo

echo "🚀 Sistema de Relatórios - Setup de Deploy"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto!"
    exit 1
fi

print_status "Verificando estrutura do projeto..."

# Verificar se o build funciona
print_info "Testando build do frontend..."
if npm run build; then
    print_status "Build do frontend OK!"
else
    print_error "Build do frontend falhou!"
    exit 1
fi

# Verificar se o backend tem as dependências
print_info "Verificando backend..."
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    print_status "Backend encontrado!"
    
    # Instalar dependências do backend
    print_info "Instalando dependências do backend..."
    cd backend
    if npm install; then
        print_status "Dependências do backend instaladas!"
    else
        print_error "Falha ao instalar dependências do backend!"
        exit 1
    fi
    cd ..
else
    print_error "Backend não encontrado!"
    exit 1
fi

# Criar arquivo .env.example para o backend
print_info "Criando arquivo de exemplo de variáveis de ambiente..."
cat > backend/.env.example << EOF
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=relatorios_db
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# Configurações do Servidor
NODE_ENV=development
PORT=3001
JWT_SECRET=sua_chave_jwt_super_secreta_aqui

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3005
EOF

print_status "Arquivo .env.example criado!"

# Criar arquivo .env.example para o frontend
print_info "Criando arquivo de exemplo para o frontend..."
cat > .env.example << EOF
# URL do Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Configurações da Aplicação
NEXT_PUBLIC_APP_NAME=Sistema de Relatórios
EOF

print_status "Arquivo .env.example do frontend criado!"

# Verificar se Git está configurado
print_info "Verificando configuração do Git..."
if git config --get user.name > /dev/null 2>&1; then
    print_status "Git configurado!"
else
    print_warning "Git não configurado. Configure com:"
    echo "git config --global user.name 'Seu Nome'"
    echo "git config --global user.email 'seu@email.com'"
fi

# Verificar se há commits
if git log --oneline -1 > /dev/null 2>&1; then
    print_status "Repositório Git inicializado!"
else
    print_warning "Nenhum commit encontrado. Execute:"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
fi

# Criar script de teste do banco
print_info "Criando script de teste do banco..."
cat > test-database.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexão OK! Hora atual:', result.rows[0].now);
    
    // Testar se as tabelas existem
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Tabelas encontradas:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    console.log('🎉 Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

print_status "Script de teste do banco criado!"

# Criar script de deploy para Railway
print_info "Criando script de deploy para Railway..."
cat > railway-deploy.sh << 'EOF'
#!/bin/bash

# Script para deploy no Railway
echo "🚂 Deploy no Railway..."

# Verificar se railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado!"
    echo "Instale com: npm install -g @railway/cli"
    exit 1
fi

# Login no Railway
echo "🔐 Fazendo login no Railway..."
railway login

# Deploy
echo "🚀 Fazendo deploy..."
railway up

echo "✅ Deploy concluído!"
EOF

chmod +x railway-deploy.sh
print_status "Script de deploy do Railway criado!"

# Criar script de deploy para Vercel
print_info "Criando script de deploy para Vercel..."
cat > vercel-deploy.sh << 'EOF'
#!/bin/bash

# Script para deploy no Vercel
echo "▲ Deploy no Vercel..."

# Verificar se vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado!"
    echo "Instale com: npm install -g vercel"
    exit 1
fi

# Login no Vercel
echo "🔐 Fazendo login no Vercel..."
vercel login

# Deploy
echo "🚀 Fazendo deploy..."
vercel --prod

echo "✅ Deploy concluído!"
EOF

chmod +x vercel-deploy.sh
print_status "Script de deploy do Vercel criado!"

# Resumo final
echo ""
echo "🎉 Setup de Deploy Concluído!"
echo "=============================="
echo ""
print_status "Arquivos criados:"
echo "  - backend/.env.example"
echo "  - .env.example"
echo "  - test-database.js"
echo "  - railway-deploy.sh"
echo "  - vercel-deploy.sh"
echo ""
print_info "Próximos passos:"
echo "1. Configure as variáveis de ambiente nos arquivos .env"
echo "2. Execute: node test-database.js (para testar o banco)"
echo "3. Para deploy no Railway: ./railway-deploy.sh"
echo "4. Para deploy no Vercel: ./vercel-deploy.sh"
echo ""
print_warning "Lembre-se de:"
echo "- Configurar as variáveis de ambiente nos painéis do Railway e Vercel"
echo "- Executar as migrações do banco de dados"
echo "- Testar a aplicação após o deploy"
echo ""
print_info "Para mais detalhes, consulte o arquivo DEPLOY-GUIDE.md"
echo ""
echo "🚀 Boa sorte com o deploy!"

