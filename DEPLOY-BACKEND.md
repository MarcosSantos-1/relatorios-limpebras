# Railway Deploy Configuration

## Backend (Node.js)

### 1. Configurar Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Conectar ao projeto existente
railway link
```

### 2. Variáveis de Ambiente
```bash
# Configurar variáveis no Railway Dashboard ou via CLI
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=your_super_secret_jwt_key_here
railway variables set JWT_EXPIRES_IN=7d
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
railway variables set MAX_FILE_SIZE=10485760
railway variables set ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
railway variables set UPLOAD_DIR=./uploads
railway variables set PDF_OUTPUT_DIR=./generated-pdfs
railway variables set PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage

# Banco de dados PostgreSQL
railway variables set DB_HOST=your_postgres_host
railway variables set DB_PORT=5432
railway variables set DB_NAME=your_database_name
railway variables set DB_USER=your_username
railway variables set DB_PASSWORD=your_password
```

### 3. Deploy
```bash
# Deploy automático via Git
git add .
git commit -m "Deploy backend"
git push origin main

# Ou deploy manual
railway up
```

## Frontend (Next.js)

### 1. Configurar Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 2. Variáveis de Ambiente no Vercel
```bash
# No dashboard do Vercel, configurar:
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
```

## Alternativa: Deploy Completo no Railway

### 1. Configurar Monorepo
```bash
# Estrutura do projeto
relatorios-app/
├── backend/
│   ├── package.json
│   ├── src/
│   └── ...
├── frontend/
│   ├── package.json
│   ├── app/
│   └── ...
└── railway.json
```

### 2. railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Deploy
```bash
railway up
```

## Configuração do Banco de Dados

### 1. PostgreSQL no Railway
```bash
# Adicionar serviço PostgreSQL
railway add postgresql

# Obter variáveis de conexão
railway variables
```

### 2. Executar Migrações
```bash
# Conectar ao banco
railway connect postgres

# Executar migração
\i migrations/001_initial_schema.sql
```

## Monitoramento e Logs

### 1. Logs
```bash
# Ver logs em tempo real
railway logs

# Ver logs específicos
railway logs --service backend
```

### 2. Métricas
- Acessar Railway Dashboard
- Ver métricas de CPU, memória, rede
- Configurar alertas

## Troubleshooting

### 1. Problemas Comuns
- **Puppeteer não funciona**: Verificar variáveis PUPPETEER_ARGS
- **Upload de arquivos**: Verificar limites de tamanho
- **CORS**: Verificar CORS_ORIGIN
- **Banco de dados**: Verificar variáveis de conexão

### 2. Debug
```bash
# Ver variáveis de ambiente
railway variables

# Conectar ao container
railway shell

# Ver logs detalhados
railway logs --follow
```

## Scripts de Deploy

### deploy.sh
```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

# Backend
echo "📦 Deploying backend..."
cd backend
railway up --detach

# Frontend
echo "🌐 Deploying frontend..."
cd ../frontend
vercel --prod

echo "✅ Deploy concluído!"
```

### package.json scripts
```json
{
  "scripts": {
    "deploy:backend": "cd backend && railway up",
    "deploy:frontend": "cd frontend && vercel --prod",
    "deploy:all": "./deploy.sh"
  }
}
```
