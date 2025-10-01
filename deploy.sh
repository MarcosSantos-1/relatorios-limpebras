#!/bin/bash

# 🚀 Script de Deploy para Vercel
# Sistema de Relatórios Limpebras

echo "🚀 Iniciando deploy para Vercel..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}❌ ERRO:${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}✅ SUCESSO:${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️  AVISO:${NC} $1"
}

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto"
fi

log "Verificando dependências..."

# 2. Instalar dependências
if ! npm install; then
    error "Falha ao instalar dependências"
fi

success "Dependências instaladas"

# 3. Executar lint
log "Executando verificação de código..."
if ! npm run lint; then
    warning "Problemas encontrados no lint. Continuando..."
fi

# 4. Build do projeto
log "Executando build..."
if ! npm run build; then
    error "Falha no build. Verifique os erros acima."
fi

success "Build concluído com sucesso"

# 5. Verificar se git está configurado
log "Verificando configuração do Git..."
if [ ! -d ".git" ]; then
    warning "Git não inicializado. Inicializando..."
    git init
    git add .
    git commit -m "Initial commit: Sistema de Relatórios LimpaSP"
fi

# 6. Verificar status do git
if [ -n "$(git status --porcelain)" ]; then
    log "Committing mudanças..."
    git add .
    git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
fi

# 7. Push para GitHub (se remote configurado)
if git remote get-url origin > /dev/null 2>&1; then
    log "Fazendo push para GitHub..."
    if ! git push origin main; then
        warning "Falha no push para GitHub. Verifique a configuração do remote."
    else
        success "Push para GitHub concluído"
    fi
else
    warning "Remote 'origin' não configurado. Configure com:"
    echo "git remote add origin https://github.com/SEU_USUARIO/relatorios-limpaSP.git"
fi

# 8. Verificar se Vercel CLI está instalado
if command -v vercel &> /dev/null; then
    log "Vercel CLI encontrado. Fazendo deploy..."
    
    # Login se necessário
    if ! vercel whoami &> /dev/null; then
        warning "Não logado na Vercel. Faça login:"
        echo "vercel login"
    else
        # Deploy
        if vercel --prod; then
            success "Deploy para Vercel concluído!"
        else
            error "Falha no deploy para Vercel"
        fi
    fi
else
    warning "Vercel CLI não instalado. Instale com:"
    echo "npm i -g vercel"
    echo ""
    echo "Ou use a interface web: https://vercel.com"
fi

# 9. Informações finais
echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com/dashboard"
echo "2. Verifique se o projeto foi deployado"
echo "3. Teste a aplicação na URL fornecida"
echo ""
echo "⚠️  LEMBRE-SE:"
echo "- IndexedDB funciona apenas no navegador do usuário"
echo "- Dados não persistem entre atualizações da aplicação"
echo "- Para produção real, considere implementar um backend"
echo ""
echo "🔗 Links úteis:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Documentação: https://vercel.com/docs"
echo "- Suporte: https://vercel.com/help"
