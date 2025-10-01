# 🚀 Guia de Deploy - Sistema de Relatórios

## Deploy no Vercel (Recomendado)

### 1. Preparação
```bash
# Instalar dependências
npm install

# Testar build local
npm run build
npm start
```

### 2. Configurar Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Deploy Automático
- Push para `main` = Deploy automático
- Branch `develop` = Preview deploy

## Configuração do Supabase

### 1. Executar Scripts SQL
```sql
-- Execute no SQL Editor do Supabase:
-- 1. setup-supabase.sql (tabelas básicas)
-- 2. setup-upload-simples.sql (políticas públicas)
```

### 2. Configurar Storage
1. Vá para **Storage** → **Buckets**
2. Crie bucket `documentos` (se não existir)
3. Configure como **público**
4. Adicione políticas:
   - SELECT: `public`, `authenticated`, `anon`
   - INSERT: `public`, `authenticated`, `anon`
   - UPDATE: `public`, `authenticated`, `anon`
   - DELETE: `public`, `authenticated`, `anon`

## Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://rzurwjixlqremctcpwhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Produção (Vercel)
- Configure no dashboard do Vercel
- Use suas credenciais do Supabase de produção

## Verificação Pós-Deploy

### ✅ Checklist
- [ ] Site carrega sem erros
- [ ] Upload de documentos funciona
- [ ] Download funciona
- [ ] Remoção de documentos funciona
- [ ] Calendário carrega
- [ ] Formulários funcionam

### 🔧 Troubleshooting
- **Erro 500**: Verificar variáveis de ambiente
- **Upload falha**: Verificar políticas do Supabase Storage
- **Banco não conecta**: Verificar URL e chave do Supabase

## Performance

### Otimizações Incluídas
- ✅ Cache headers configurados
- ✅ Build otimizado para produção
- ✅ Imagens otimizadas
- ✅ Bundle splitting automático

### Monitoramento
- Use Vercel Analytics para métricas
- Monitore logs no dashboard do Vercel
- Configure alertas de erro

---

**Deploy pronto!** 🎉
