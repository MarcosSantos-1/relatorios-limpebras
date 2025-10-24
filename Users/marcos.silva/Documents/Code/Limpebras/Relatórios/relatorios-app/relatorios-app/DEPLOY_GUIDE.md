# 🚀 GUIA DE DEPLOY - SISTEMA DE RELATÓRIOS LIMPEBRAS

## 📋 RESUMO DO SISTEMA

- **Frontend**: Next.js (Vercel)
- **Backend**: Go + Gin (Render/Railway/Heroku)
- **Banco**: PostgreSQL (Neon)
- **PDF**: Puppeteer + Node.js

## 🔧 CONFIGURAÇÃO DO BACKEND

### 1. Escolha uma plataforma para o backend:

#### A) RENDER.COM (Recomendado)
- Conecte o repositório GitHub
- Configure as variáveis de ambiente (veja backend-env-example.txt)
- Build Command: `cd backend && go build -o main main.go`
- Start Command: `cd backend && ./main`

#### B) RAILWAY.APP
- Conecte o repositório GitHub
- Configure as variáveis de ambiente
- Railway detecta automaticamente o Go

#### C) HEROKU
- Conecte o repositório GitHub
- Configure as variáveis de ambiente
- Buildpack: `heroku/go`

### 2. Variáveis de ambiente do backend:
```env
DB_HOST=ep-snowy-queen-acl6wrv7-pooler.sa-east-1.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_HTYN1uIfV2zW
DB_NAME=neondb
DB_SSLMODE=require
PORT=8080
GIN_MODE=release
TEMP_DIR=/tmp
JWT_SECRET=sua-chave-secreta-super-segura
CORS_ORIGINS=https://relatorios-limpebras.vercel.app
```

## 🌐 CONFIGURAÇÃO DO FRONTEND (Vercel)

### 1. Conecte o repositório ao Vercel
- Vá para vercel.com
- Conecte o GitHub
- Selecione o repositório

### 2. Configure as variáveis de ambiente:
```env
NEXT_PUBLIC_API_URL=https://seu-backend-url.onrender.com/api
```

### 3. Deploy automático
- O Vercel fará deploy automático
- Atualize o CORS_ORIGINS no backend com a URL do Vercel

## 🔐 SEGURANÇA IMPORTANTE

### 1. JWT Secret
- Use uma chave longa e aleatória
- Exemplo: `openssl rand -base64 32`

### 2. CORS Origins
- Configure apenas os domínios permitidos
- Exemplo: `https://relatorios-limpebras.vercel.app`

### 3. Banco de dados
- Use SSL obrigatório
- Configure firewall se necessário

## 📱 TESTE PÓS-DEPLOY

### 1. Frontend
- Acesse a URL do Vercel
- Teste login/logout
- Teste criação de relatórios

### 2. Backend
- Teste: `https://seu-backend-url.com/health`
- Teste criação de relatórios
- Teste geração de PDF

### 3. Integração
- Teste login no frontend
- Teste criação de relatórios
- Teste exportação de PDF

## 🐛 PROBLEMAS COMUNS

### 1. CORS Error
- Verifique CORS_ORIGINS no backend
- Inclua a URL exata do frontend

### 2. PDF não funciona
- Verifique se Node.js está instalado no servidor
- Verifique TEMP_DIR
- Verifique logs do backend

### 3. Banco não conecta
- Verifique DB_HOST, DB_USER, DB_PASSWORD
- Verifique DB_SSLMODE=require
- Teste conexão localmente

## 📞 SUPORTE

Se houver problemas:
1. Verifique logs do backend
2. Verifique logs do frontend (Vercel)
3. Teste endpoints individualmente
4. Verifique variáveis de ambiente

---

**Sistema pronto para produção!** 🚀
