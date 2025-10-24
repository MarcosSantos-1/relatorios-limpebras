# 🐳 Guia de Instalação do Docker Desktop para Windows

## Opção 1: Instalar Docker Desktop (Recomendado)

### 1. Baixar Docker Desktop
- Acesse: https://www.docker.com/products/docker-desktop/
- Clique em "Download for Windows"
- Baixe o arquivo `Docker Desktop Installer.exe`

### 2. Instalar
- Execute o instalador como administrador
- Marque "Use WSL 2 instead of Hyper-V" (recomendado)
- Clique em "Install"
- Reinicie o computador quando solicitado

### 3. Verificar instalação
```powershell
docker --version
docker-compose --version
```

## Opção 2: Usar PostgreSQL Local (Sem Docker)

Se não quiser instalar Docker, você pode usar PostgreSQL local:

### 1. Instalar PostgreSQL
- Baixe em: https://www.postgresql.org/download/windows/
- Instale com as configurações padrão
- Lembre da senha que você definir para o usuário `postgres`

### 2. Criar banco de dados
```sql
-- Conecte no PostgreSQL e execute:
CREATE DATABASE relatorios;
```

### 3. Configurar variáveis de ambiente
Edite o arquivo `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=relatorios
DB_SSLMODE=disable
PORT=8080
GIN_MODE=debug
TEMP_DIR=C:\temp
JWT_SECRET=sua-chave-secreta-aqui
```

## Opção 3: Usar Banco Online (Mais Fácil)

### Neon (PostgreSQL na nuvem - GRÁTIS)
1. Acesse: https://neon.tech/
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a string de conexão
5. Configure no `.env`:

```env
DB_HOST=ep-cool-name-123456.us-east-1.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=sua_senha_neon
DB_NAME=neondb
DB_SSLMODE=require
```

### Supabase (PostgreSQL na nuvem - GRÁTIS)
1. Acesse: https://supabase.com/
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em Settings > Database
5. Copie as informações de conexão

## 🚀 Como Executar (Qualquer Opção)

### 1. Instalar Go
- Baixe em: https://golang.org/dl/
- Instale com as configurações padrão
- Reinicie o terminal

### 2. Instalar Node.js
- Baixe em: https://nodejs.org/
- Instale a versão LTS

### 3. Executar o Backend
```powershell
cd backend
.\start-dev.ps1
```

### 4. Testar
- Acesse: http://localhost:8080/health
- Deve retornar: `{"status":"ok"}`

## 🆘 Problemas Comuns

### Erro: "go: command not found"
- Instale o Go e reinicie o terminal
- Verifique se está no PATH: `go version`

### Erro: "node: command not found"
- Instale o Node.js e reinicie o terminal
- Verifique se está no PATH: `node --version`

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão manualmente

### Erro de Puppeteer
- Execute: `npm install -g puppeteer`
- Se der erro, execute: `npm install -g puppeteer --unsafe-perm=true`
