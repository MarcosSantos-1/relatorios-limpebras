# Sistema de Relatórios - Backend Node.js

## 🎯 Solução Completa

Este backend resolve os problemas da sua aplicação Next.js:

- ✅ **Geração de PDFs funcionando**: Puppeteer configurado para produção
- ✅ **Armazenamento permanente**: PostgreSQL com backup automático
- ✅ **Upload de arquivos**: Sistema robusto com otimização de imagens
- ✅ **API REST completa**: Todos os endpoints necessários
- ✅ **Autenticação segura**: JWT com refresh automático
- ✅ **Deploy simplificado**: Railway + Vercel

## 🚀 Início Rápido

### 1. Setup Automático
```bash
# Executar script de configuração
./setup-backend.sh
```

### 2. Setup Manual
```bash
# Instalar dependências
cd backend
npm install

# Configurar ambiente
cp env.example .env
# Editar .env com suas configurações

# Criar diretórios
mkdir -p uploads generated-pdfs logs

# Executar migrações
node migrations/migrate.js

# Iniciar servidor
npm run dev
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/     # Controladores das rotas
│   ├── middleware/     # Middlewares (auth, validation)
│   ├── models/         # Modelos do banco de dados
│   ├── routes/         # Definição das rotas
│   ├── services/       # Lógica de negócio
│   ├── utils/          # Utilitários
│   ├── config/         # Configurações
│   └── server.js       # Arquivo principal
├── migrations/         # Scripts de migração
├── uploads/           # Arquivos enviados
├── generated-pdfs/    # PDFs gerados
└── package.json
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=relatorios_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# PDF
PDF_OUTPUT_DIR=./generated-pdfs
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha

### Relatórios
- `GET /api/relatorios` - Listar relatórios
- `POST /api/relatorios` - Criar relatório
- `GET /api/relatorios/:id` - Obter relatório
- `PUT /api/relatorios/:id` - Atualizar relatório
- `DELETE /api/relatorios/:id` - Deletar relatório

### Upload de Arquivos
- `POST /api/upload/single` - Upload único
- `POST /api/upload/multiple` - Upload múltiplo
- `GET /api/upload/relatorio/:id` - Listar evidências
- `PUT /api/upload/:id` - Atualizar evidência
- `DELETE /api/upload/:id` - Deletar evidência
- `GET /api/upload/:id/download` - Download arquivo
- `GET /api/upload/:id/view` - Visualizar imagem

### Geração de PDFs
- `POST /api/pdf/generate` - Gerar PDF individual
- `POST /api/pdf/generate-consolidated` - Gerar PDF consolidado
- `GET /api/pdf/list/:relatorio_id` - Listar PDFs
- `GET /api/pdf/download/:pdf_id` - Download PDF
- `DELETE /api/pdf/:pdf_id` - Deletar PDF

## 🗄️ Banco de Dados

### Schema Principal
- **usuarios**: Usuários do sistema
- **relatorios**: Relatórios principais
- **evidencias**: Fotos e arquivos
- **pdfs_gerados**: PDFs gerados
- **documentos**: Documentos gerais
- **anotacoes**: Anotações dos usuários
- **acumuladores**: Planejamento de acumuladores
- **eventos**: Eventos agendados

### Migrações
```bash
# Executar migrações
node migrations/migrate.js

# Criar usuário admin padrão
# Email: admin@prefeitura.com
# Senha: admin123
```

## 🔒 Segurança

- **JWT Authentication**: Tokens seguros com expiração
- **Password Hashing**: bcryptjs para senhas
- **File Upload Validation**: Tipos e tamanhos limitados
- **CORS Protection**: Configurável por ambiente
- **Rate Limiting**: Proteção contra spam
- **Input Validation**: Sanitização de dados

## 📊 Geração de PDFs

### Características
- **Puppeteer otimizado**: Configuração para produção
- **Templates responsivos**: Layout A4 landscape
- **Imagens otimizadas**: Sharp para compressão
- **Múltiplos tipos**: Mutirão, Revitalização, Rotineiros, etc.
- **Consolidação**: PDFs agrupados por período

### Configuração Puppeteer
```javascript
// Produção
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--single-process'
]

// Desenvolvimento
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
]
```

## 🚀 Deploy

### Railway (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

### Heroku
```bash
# Instalar Heroku CLI
# Criar app e deploy
heroku create relatorios-backend
git push heroku main
```

### DigitalOcean App Platform
- Conectar repositório GitHub
- Configurar build settings
- Deploy automático

## 📱 Frontend Integration

### Cliente API
```javascript
import { authService, relatoriosService, uploadService } from '@/lib/api-client';

// Login
const response = await authService.login(email, password);

// Criar relatório
const relatorio = await relatoriosService.create({
  tipo_servico: 'MUTIRAO',
  titulo: 'Mutirão SP',
  data_relatorio: '2024-01-15',
  sub_regiao: 'SP'
});

// Upload de arquivo
const evidencia = await uploadService.uploadSingle(file, relatorioId, {
  descricao: 'Foto antes',
  etapa: 'ANTES'
});

// Gerar PDF
const pdf = await relatoriosService.generatePDF(relatorioId);
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Migrações
npm run migrate

# Logs
npm run logs

# Testes
npm test
```

## 📈 Monitoramento

### Health Check
- `GET /health` - Status do servidor
- Métricas de CPU, memória, disco
- Status do banco de dados

### Logs
- Logs estruturados com Winston
- Rotação automática de arquivos
- Níveis: error, warn, info, debug

## 🐛 Troubleshooting

### Problemas Comuns

1. **Puppeteer não funciona**
   - Verificar variáveis PUPPETEER_ARGS
   - Instalar dependências do sistema

2. **Upload de arquivos falha**
   - Verificar limites MAX_FILE_SIZE
   - Verificar tipos ALLOWED_FILE_TYPES

3. **Banco de dados não conecta**
   - Verificar variáveis DB_*
   - Verificar se PostgreSQL está rodando

4. **CORS errors**
   - Verificar CORS_ORIGIN
   - Adicionar domínio do frontend

### Debug
```bash
# Ver logs detalhados
NODE_ENV=development npm run dev

# Verificar variáveis
railway variables

# Conectar ao banco
railway connect postgres
```

## 📚 Documentação Adicional

- [Deploy Guide](DEPLOY-BACKEND.md)
- [API Documentation](backend/README.md)
- [Database Schema](backend/migrations/001_initial_schema.sql)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Consultar documentação
3. Verificar configurações de ambiente
4. Testar endpoints com Postman/Insomnia

---

**🎉 Pronto para usar!** Seu sistema de relatórios agora tem um backend robusto que resolve todos os problemas de geração de PDFs e armazenamento permanente.
