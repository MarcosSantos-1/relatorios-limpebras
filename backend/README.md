# Backend - Sistema de Relatórios

## Configuração do Ambiente

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

3. **Configurar banco de dados PostgreSQL:**
- Criar banco de dados
- Executar migrations: `npm run migrate`

4. **Executar em desenvolvimento:**
```bash
npm run dev
```

5. **Executar em produção:**
```bash
npm start
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/     # Controladores das rotas
│   ├── middleware/      # Middlewares (auth, validation, etc.)
│   ├── models/         # Modelos do banco de dados
│   ├── routes/         # Definição das rotas
│   ├── services/       # Lógica de negócio
│   ├── utils/          # Utilitários
│   ├── config/         # Configurações
│   └── server.js       # Arquivo principal
├── migrations/         # Scripts de migração do banco
├── uploads/           # Arquivos enviados (fotos, etc.)
└── generated-pdfs/    # PDFs gerados
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

### Relatórios
- `GET /api/relatorios` - Listar relatórios
- `POST /api/relatorios` - Criar relatório
- `GET /api/relatorios/:id` - Obter relatório
- `PUT /api/relatorios/:id` - Atualizar relatório
- `DELETE /api/relatorios/:id` - Deletar relatório

### PDFs
- `POST /api/pdf/generate` - Gerar PDF
- `GET /api/pdf/:id` - Download PDF

### Uploads
- `POST /api/upload` - Upload de arquivos
- `GET /api/uploads/:filename` - Download arquivo

## Deploy

### Railway
1. Conectar repositório ao Railway
2. Configurar variáveis de ambiente
3. Deploy automático

### Heroku
1. `heroku create relatorios-backend`
2. `heroku addons:create heroku-postgresql:hobby-dev`
3. `git push heroku main`

### DigitalOcean App Platform
1. Conectar repositório
2. Configurar build settings
3. Configurar variáveis de ambiente
4. Deploy
