# 🚀 Guia Completo de Deploy - Sistema de Relatórios

## 📋 Visão Geral
Este guia te ajudará a fazer o deploy completo do sistema de relatórios, incluindo:
- ✅ Frontend (Next.js) no Vercel
- ✅ Backend (Node.js) no Railway/Render
- ✅ Banco de dados PostgreSQL

## 🎯 1. Deploy do Frontend (Vercel)

### Passo 1: Criar conta no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Conecte seu repositório

### Passo 2: Configurar variáveis de ambiente
No painel do Vercel, adicione estas variáveis:
```
NEXT_PUBLIC_API_URL=https://seu-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=Sistema de Relatórios
```

### Passo 3: Deploy automático
- O Vercel fará deploy automático a cada push no repositório
- URL será: `https://seu-projeto.vercel.app`

## 🎯 2. Deploy do Backend (Railway)

### Passo 1: Criar conta no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project" > "Deploy from GitHub repo"

### Passo 2: Configurar o projeto
1. Selecione o repositório
2. Railway detectará automaticamente que é um projeto Node.js
3. Configure o diretório raiz como `backend/`

### Passo 3: Configurar variáveis de ambiente
No painel do Railway, adicione:
```
NODE_ENV=production
PORT=3001
DB_HOST=seu-host-postgres
DB_PORT=5432
DB_NAME=relatorios_db
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
JWT_SECRET=sua-chave-jwt-super-secreta
```

### Passo 4: Configurar banco PostgreSQL
1. No Railway, clique em "New" > "Database" > "PostgreSQL"
2. Railway criará automaticamente as variáveis de ambiente
3. Execute as migrações (veja seção 3)

## 🎯 3. Configurar Banco de Dados

### Passo 1: Conectar ao banco
```bash
# Instalar PostgreSQL client (se necessário)
brew install postgresql

# Conectar ao banco
psql "postgresql://usuario:senha@host:porta/relatorios_db"
```

### Passo 2: Executar migrações
```sql
-- Execute o conteúdo do arquivo backend/migrations/001_initial_schema.sql
-- Ou rode o script de migração
```

### Passo 3: Verificar tabelas
```sql
\dt
-- Deve mostrar: usuarios, relatorios, evidencias, pdfs_gerados, etc.
```

## 🎯 4. Configurar Domínio Personalizado (Opcional)

### Frontend (Vercel)
1. No painel do Vercel, vá em "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS apontando para Vercel

### Backend (Railway)
1. No painel do Railway, vá em "Settings" > "Domains"
2. Configure domínio personalizado
3. Atualize `NEXT_PUBLIC_API_URL` no Vercel

## 🎯 5. Testes Pós-Deploy

### Testar Frontend
1. Acesse a URL do Vercel
2. Teste login com usuário admin
3. Crie um relatório de teste
4. Verifique se está salvando no backend

### Testar Backend
1. Acesse `https://seu-backend.railway.app/health`
2. Deve retornar: `{"status": "ok", "message": "Servidor funcionando"}`
3. Teste endpoints de autenticação

### Testar Banco de Dados
1. Crie um usuário via frontend
2. Verifique se aparece na tabela `usuarios`
3. Crie um relatório e verifique na tabela `relatorios`

## 🎯 6. Monitoramento e Logs

### Vercel
- Logs disponíveis no painel do Vercel
- Métricas de performance automáticas

### Railway
- Logs em tempo real no painel
- Métricas de CPU/RAM
- Alertas configuráveis

## 🎯 7. Backup e Segurança

### Backup do Banco
```bash
# Backup manual
pg_dump "postgresql://usuario:senha@host:porta/relatorios_db" > backup.sql

# Restore
psql "postgresql://usuario:senha@host:porta/relatorios_db" < backup.sql
```

### Segurança
- ✅ HTTPS automático (Vercel + Railway)
- ✅ Variáveis de ambiente seguras
- ✅ JWT tokens com expiração
- ✅ Validação de entrada
- ✅ Rate limiting (backend)

## 🎯 8. Custos Estimados

### Vercel (Frontend)
- **Hobby Plan**: Gratuito
- **Pro Plan**: $20/mês (se precisar de mais recursos)

### Railway (Backend + Database)
- **Starter**: $5/mês
- **Developer**: $20/mês
- **Team**: $99/mês

### Total Estimado: $5-25/mês

## 🎯 9. Troubleshooting

### Problemas Comuns

#### Frontend não conecta ao backend
- Verifique `NEXT_PUBLIC_API_URL` no Vercel
- Confirme se o backend está rodando
- Verifique CORS no backend

#### Erro de banco de dados
- Verifique variáveis de ambiente
- Confirme se as migrações foram executadas
- Teste conexão manual

#### PDFs não geram
- Verifique logs do Railway
- Confirme se Puppeteer está funcionando
- Teste endpoint `/api/test-pdf`

### Logs Importantes
```bash
# Railway logs
railway logs

# Vercel logs (no painel)
# Ou via CLI
vercel logs
```

## 🎯 10. Próximos Passos

1. **Configurar CI/CD**: GitHub Actions para testes automáticos
2. **Monitoramento**: Sentry para error tracking
3. **Analytics**: Google Analytics no frontend
4. **Backup automático**: Scripts de backup do banco
5. **Scaling**: Configurar auto-scaling no Railway

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs primeiro
2. Teste localmente
3. Consulte a documentação do Vercel/Railway
4. Abra uma issue no repositório

---

**🎉 Parabéns! Seu sistema de relatórios está online!**

