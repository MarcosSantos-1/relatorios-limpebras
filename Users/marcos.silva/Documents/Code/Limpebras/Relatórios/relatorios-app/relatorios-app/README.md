# Sistema de Relatórios Limpebras

Sistema completo para geração de relatórios fotográficos com backend em Go e frontend em Next.js.

## 🏗️ Arquitetura

- **Frontend**: Next.js 15 com TypeScript
- **Backend**: Go com Gin framework
- **Banco de Dados**: PostgreSQL (Neon para produção)
- **Autenticação**: JWT simples
- **Deploy**: Render.com

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Go 1.21+
- PostgreSQL (ou conta no Neon)

### 1. Configurar Backend

```bash
cd backend

# Instalar dependências
go mod tidy

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Executar migrações e iniciar servidor
go run main.go
```

### 2. Configurar Frontend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.local.example .env.local
# Editar .env.local com URL do backend

# Iniciar em modo desenvolvimento
npm run dev
```

### 3. Acesso

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Login padrão: `marcos.silva` / `2020`

## 📁 Estrutura do Projeto

```
├── backend/                 # Backend em Go
│   ├── internal/
│   │   ├── config/         # Configurações
│   │   ├── database/       # Conexão e migrações
│   │   ├── handlers/       # Rotas da API
│   │   ├── middleware/     # Middlewares (auth, etc)
│   │   └── models/        # Modelos de dados
│   ├── main.go            # Ponto de entrada
│   └── Dockerfile         # Container do backend
├── app/                   # Frontend Next.js
│   ├── api/              # Rotas da API (removidas)
│   ├── components/       # Componentes React
│   ├── login/           # Página de login
│   └── relatorios/      # Páginas de relatórios
├── lib/                  # Utilitários do frontend
│   ├── auth.ts          # Sistema de autenticação
│   ├── api-client.js    # Cliente da API
│   └── pdf/            # Geradores de PDF (mantidos)
└── docker-compose.yml   # Orquestração local
```

## 🔐 Autenticação

Sistema simples de autenticação JWT:

- **Usuário Host**: `marcos.silva` / `2020`
- **Roles**: `host`, `admin`, `user`
- **Token**: JWT com expiração de 24h

## 🗄️ Banco de Dados

### Tabelas Principais

- `users`: Usuários do sistema
- `relatorios`: Relatórios criados
- `evidencias`: Fotos/evidências
- `pdfs`: PDFs gerados

### Migrações

As migrações são executadas automaticamente na inicialização do backend.

## 📊 Funcionalidades

### Relatórios Suportados

- **Mutirão**: Relatórios de mutirão (SELIMP)
- **Registro**: Registros fotográficos diversos
- **Evidências**: Evidências fotográficas gerais
- **Eventos**: Relatórios de eventos
- **Unificados**: Relatórios consolidados
- **Monumentos**: Relatórios de monumentos
- **Rotineiros**: Serviços rotineiros

### Upload de Evidências

- Upload individual ou múltiplo
- Suporte a imagens (JPG, PNG, etc)
- Metadados personalizáveis
- Visualização e download

### Geração de PDFs

- Templates específicos por tipo
- Geração individual ou consolidada
- Download direto
- Histórico de PDFs gerados

## 🚀 Deploy

### Render.com

1. **Backend**:
   - Conectar repositório
   - Build Command: `cd backend && go build -o main .`
   - Start Command: `cd backend && ./main`
   - Environment: `DATABASE_URL`, `JWT_SECRET`

2. **Frontend**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: `NEXT_PUBLIC_API_URL`

3. **Banco de Dados**:
   - Criar banco PostgreSQL no Neon
   - Configurar `DATABASE_URL` no backend

### Docker

```bash
# Executar localmente
docker-compose up

# Build para produção
docker-compose -f docker-compose.prod.yml up
```

## 🔧 Desenvolvimento

### Backend

```bash
cd backend

# Executar testes
go test ./...

# Formatar código
go fmt ./...

# Verificar código
go vet ./...
```

### Frontend

```bash
# Executar linting
npm run lint

# Build de produção
npm run build

# Executar em produção
npm start
```

## 📝 Notas Importantes

1. **Firebase Removido**: Todas as dependências do Firebase foram removidas
2. **Puppeteer**: Lógica movida para o backend (placeholder implementado)
3. **Autenticação**: Sistema simplificado com JWT
4. **Uploads**: Arquivos salvos localmente (configurar storage em produção)
5. **PDFs**: Geração movida para backend (implementar com Puppeteer)

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**:
   - Verificar `DATABASE_URL`
   - Confirmar que o banco está acessível

2. **Erro de autenticação**:
   - Verificar `JWT_SECRET`
   - Confirmar que o usuário existe

3. **Upload não funciona**:
   - Verificar permissões de diretório
   - Confirmar que o diretório `uploads/` existe

4. **PDF não gera**:
   - Implementar lógica de geração no backend
   - Verificar dependências do Puppeteer

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.