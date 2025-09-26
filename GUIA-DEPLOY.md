# 🚀 Guia Completo de Deploy na Vercel

## 📋 Pré-requisitos

- ✅ Conta na Vercel (gratuita)
- ✅ Conta no Supabase (gratuita)
- ✅ Repositório no GitHub (já configurado)

## 🔧 Passo 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Nome do projeto: `relatorios-limpebras`
5. Senha do banco: (anote esta senha)
6. Região: escolha a mais próxima (ex: São Paulo)

### 1.2 Configurar Banco de Dados
Execute este SQL no editor SQL do Supabase:

```sql
-- Criar tabela documentos
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('PDF', 'EXCEL', 'IMAGEM')) NOT NULL,
  categoria TEXT CHECK (categoria IN ('TEMPLATE_BALANCO', 'GUIA', 'MEMORIAL_DESCRITIVO', 'OUTROS')) NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  user_id UUID,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de documentos" ON documentos
  FOR SELECT USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Permitir inserção pública de documentos" ON documentos
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Permitir atualização pública de documentos" ON documentos
  FOR UPDATE USING (true);

-- Política para permitir exclusão pública
CREATE POLICY "Permitir exclusão pública de documentos" ON documentos
  FOR DELETE USING (true);

-- Configurar Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Política para Storage
CREATE POLICY "Permitir upload público" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Permitir leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Permitir exclusão pública" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads');
```

### 1.3 Obter Credenciais
1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 🌐 Passo 2: Deploy na Vercel

### 2.1 Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Conecte sua conta do GitHub
4. Selecione o repositório `relatorios-limpebras`
5. Clique em **"Import"**

### 2.2 Configurar Variáveis de Ambiente
Na tela de configuração do projeto:

1. **Project Name**: `relatorios-limpebras`
2. **Framework Preset**: Next.js (deve detectar automaticamente)
3. **Root Directory**: `./` (padrão)
4. **Build Command**: `npm run build:prod` (já configurado)
5. **Output Directory**: `.next` (já configurado)

#### Variáveis de Ambiente:
**IMPORTANTE**: Configure as variáveis de ambiente ANTES do deploy:

1. Clique em **"Environment Variables"**
2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-anonima-aqui
```

3. Certifique-se de que ambas estão marcadas para **Production**, **Preview** e **Development**
4. Clique em **"Save"** para cada variável

### 2.3 Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. ✅ Deploy concluído!

## 🔍 Passo 3: Verificar Deploy

### 3.1 Testar Funcionalidades
1. Acesse sua URL: `https://relatorios-limpebras.vercel.app`
2. Teste o upload de documentos
3. Verifique se os documentos aparecem na lista
4. Teste download e remoção

### 3.2 Configurar Domínio Personalizado (Opcional)
1. Vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções da Vercel

## 🛠️ Passo 4: Configurações Avançadas

### 4.1 Configurar Webhooks (Opcional)
Para notificações de deploy:
1. Vá em **Settings** > **Git**
2. Configure webhooks para Slack/Discord

### 4.2 Monitoramento
1. **Analytics**: Ativado automaticamente
2. **Speed Insights**: Ativado automaticamente
3. **Real User Monitoring**: Disponível no dashboard

## 🚨 Troubleshooting

### Problema: "Environment Variable references Secret which does not exist"
**Solução**: 
1. Remova as referências a secrets do `vercel.json`
2. Configure as variáveis de ambiente diretamente na interface da Vercel
3. Certifique-se de que as variáveis estão configuradas ANTES do deploy

### Problema: Build falha
**Solução**: Verifique se todas as variáveis de ambiente estão configuradas

### Problema: Upload não funciona
**Solução**: Verifique as políticas RLS do Supabase

### Problema: Erro 500
**Solução**: Verifique os logs na Vercel Dashboard

### Problema: Variáveis de ambiente não funcionam
**Solução**: 
1. Certifique-se de que as variáveis começam com `NEXT_PUBLIC_`
2. Verifique se estão marcadas para todos os ambientes (Production, Preview, Development)
3. Faça um novo deploy após adicionar as variáveis

## 📊 Monitoramento

### Logs da Vercel
1. Acesse seu projeto na Vercel
2. Vá em **Functions** para ver logs das APIs
3. Use **Analytics** para métricas de performance

### Logs do Supabase
1. Acesse seu projeto no Supabase
2. Vá em **Logs** para ver queries e erros
3. Use **Database** > **Logs** para debug

## 🔄 Atualizações Futuras

Para atualizar o deploy:
```bash
git add .
git commit -m "Descrição da atualização"
git push origin master
```

A Vercel fará deploy automático! 🚀

## 📞 Suporte

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Banco de dados configurado
- [ ] Políticas RLS criadas
- [ ] Storage configurado
- [ ] Projeto Vercel criado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Funcionalidades testadas
- [ ] Domínio personalizado (opcional)

**🎉 Parabéns! Seu sistema está no ar!**
