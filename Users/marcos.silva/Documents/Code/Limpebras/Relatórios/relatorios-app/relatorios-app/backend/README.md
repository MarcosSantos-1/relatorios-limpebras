# Backend de Relatórios - Go

Este é o backend do sistema de relatórios desenvolvido em Go, com integração ao Puppeteer para geração de PDFs.

## 🚀 Características

- **Framework**: Gin (Go)
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT
- **Geração de PDF**: Puppeteer + Node.js
- **Containerização**: Docker
- **Performance**: Go é conhecido por sua alta performance

## 📋 Pré-requisitos

- Go 1.21 ou superior
- Node.js (para Puppeteer)
- PostgreSQL (local ou Docker)
- Docker (opcional, para desenvolvimento)

## 🛠️ Instalação e Configuração

### 1. Clonar e configurar

```bash
cd backend
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 2. Instalar dependências

```bash
go mod tidy
npm install -g puppeteer
```

### 3. Configurar banco de dados

#### Opção A: Docker (Recomendado)
```bash
docker-compose up -d postgres
```

#### Opção B: PostgreSQL local
- Instale PostgreSQL
- Crie um banco chamado `relatorios`
- Configure as variáveis no `.env`

### 4. Executar

#### Windows (PowerShell):
```powershell
.\start-dev.ps1
```

#### Linux/Mac:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

#### Manual:
```bash
go run main.go
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `DB_HOST` | Host do PostgreSQL | localhost |
| `DB_PORT` | Porta do PostgreSQL | 5432 |
| `DB_USER` | Usuário do banco | postgres |
| `DB_PASSWORD` | Senha do banco | postgres123 |
| `DB_NAME` | Nome do banco | relatorios |
| `PORT` | Porta do servidor | 8080 |
| `JWT_SECRET` | Chave secreta JWT | (obrigatório) |
| `TEMP_DIR` | Diretório temporário | /tmp |

## 📚 API Endpoints

### Autenticação

#### POST `/api/auth/register`
Registrar novo usuário
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nome do Usuário"
}
```

#### POST `/api/auth/login`
Fazer login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Relatórios (Requer autenticação)

#### GET `/api/relatorios`
Listar todos os relatórios do usuário

#### GET `/api/relatorios/:id`
Buscar relatório específico

#### POST `/api/relatorios`
Criar novo relatório
```json
{
  "tipo_servico": "MUTIRAO",
  "title": "Título do Relatório",
  "data": "2024-01-15",
  "sub": "CV",
  "local": "Local do evento",
  "fotos": [
    {
      "url": "data:image/jpeg;base64,...",
      "descricao": "Descrição da foto"
    }
  ]
}
```

#### PUT `/api/relatorios/:id`
Atualizar relatório

#### DELETE `/api/relatorios/:id`
Deletar relatório

#### POST `/api/relatorios/:id/pdf`
Gerar PDF do relatório

## 🐳 Docker

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
docker build -t relatorios-backend .
docker run -p 8080:8080 --env-file .env relatorios-backend
```

## 🔍 Estrutura do Projeto

```
backend/
├── main.go                 # Ponto de entrada
├── go.mod                  # Dependências Go
├── Dockerfile             # Container Docker
├── docker-compose.yml     # Orquestração
├── env.example           # Exemplo de variáveis
├── start-dev.ps1         # Script Windows
├── start-dev.sh          # Script Linux/Mac
└── internal/
    ├── config/           # Configurações
    ├── database/         # Conexão e migrações
    ├── models/           # Estruturas de dados
    ├── services/         # Lógica de negócio
    ├── handlers/         # Controllers HTTP
    └── middleware/       # Middlewares
```

## 🚀 Deploy

### Render.com
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Use o Dockerfile fornecido
4. Configure o banco PostgreSQL (Neon, Supabase, etc.)

### Vercel
1. Configure como função serverless
2. Use banco PostgreSQL externo
3. Configure variáveis de ambiente

### Railway
1. Conecte o repositório
2. Configure PostgreSQL addon
3. Configure variáveis de ambiente

## 🐛 Troubleshooting

### Erro de Puppeteer
- Certifique-se de que Node.js está instalado
- Instale Puppeteer: `npm install -g puppeteer`
- Em produção, configure `PUPPETEER_EXECUTABLE_PATH`

### Erro de banco de dados
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Execute as migrações manualmente se necessário

### Erro de CORS
- Configure `CORS_ORIGINS` no `.env`
- Adicione o domínio do frontend

## 📝 Logs

O servidor registra:
- Conexões de banco de dados
- Requisições HTTP
- Erros de geração de PDF
- Operações de autenticação

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Tokens JWT com expiração
- Validação de entrada
- Middleware de autenticação
- CORS configurado

## 📈 Performance

- Go oferece alta performance
- Conexões de banco otimizadas
- Geração de PDF assíncrona
- Cache de templates HTML
