# 🚀 Correção do Deploy no Railway

## ❌ Problema Identificado

O Railway estava tentando instalar dependências na raiz do projeto em vez do diretório `backend/`, causando conflitos entre:
- `date-fns` v2.30.0 (backend) vs v4.1.0 (frontend)
- Dependências do frontend sendo instaladas no backend

## ✅ Soluções Implementadas

### 1. Configurações do Railway Atualizadas

**Arquivo: `railway.json` (raiz)**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm ci --only=production"
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

**Arquivo: `backend/railway.json`**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --only=production"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Arquivos .railwayignore Criados

**Arquivo: `.railwayignore` (raiz)**
- Ignora todos os arquivos do frontend
- Evita conflitos de dependências

**Arquivo: `backend/.railwayignore`**
- Ignora apenas arquivos desnecessários do backend

### 3. Configuração TOML Adicional

**Arquivo: `railway.toml` (raiz)**
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd backend && npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[build.buildCommand]
command = "cd backend && npm ci --only=production"

[build.installCommand]
command = "cd backend && npm ci --only=production"
```

**Arquivo: `backend/railway.toml`**
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[build.buildCommand]
command = "npm ci --only=production"

[build.installCommand]
command = "npm ci --only=production"
```

## 🎯 Como Fazer o Deploy Agora

### Opção 1: Deploy do Backend Separado (Recomendado)

1. **No Railway Dashboard:**
   - Crie um novo projeto
   - Selecione "Deploy from GitHub repo"
   - Configure o **Root Directory** como `backend/`

2. **Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=seu-host-postgres
   DB_PORT=5432
   DB_NAME=relatorios_db
   DB_USER=seu-usuario
   DB_PASSWORD=sua-senha
   JWT_SECRET=sua-chave-jwt-super-secreta
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```

3. **Deploy:**
   - O Railway detectará automaticamente o `package.json` no diretório `backend/`
   - Usará as configurações do `backend/railway.json`

### Opção 2: Deploy com Configuração Manual

1. **No Railway Dashboard:**
   - Crie um novo projeto
   - Selecione "Deploy from GitHub repo"
   - **NÃO** configure Root Directory (deixe vazio)

2. **Configure manualmente:**
   - **Build Command:** `cd backend && npm ci --only=production`
   - **Start Command:** `cd backend && npm start`
   - **Health Check Path:** `/health`

3. **Variáveis de Ambiente:** (mesmas da Opção 1)

## 🔧 Troubleshooting

### Se ainda houver problemas:

1. **Limpar cache do Railway:**
   - Vá em Settings > Advanced
   - Clique em "Clear Build Cache"

2. **Verificar logs:**
   ```bash
   railway logs --follow
   ```

3. **Testar localmente:**
   ```bash
   cd backend
   npm ci --only=production
   npm start
   ```

## 📱 URLs Finais

- **Backend:** `https://seu-projeto.railway.app`
- **Health Check:** `https://seu-projeto.railway.app/health`
- **Frontend:** `https://seu-projeto.vercel.app`

## ✅ Verificação

Após o deploy, teste:
1. `GET /health` - Deve retornar status OK
2. `POST /api/auth/login` - Deve funcionar
3. `GET /api/relatorios` - Deve retornar dados

---

**Nota:** O problema era que o Railway estava instalando dependências do frontend no backend. Agora está configurado para instalar apenas as dependências do backend no diretório correto.
