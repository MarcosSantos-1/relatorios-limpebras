# 🚀 Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Conta no GitHub**: Para conectar o repositório
3. **Variáveis de ambiente**: Configuradas no Supabase

## 🔧 Configuração do Deploy

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Conecte sua conta do GitHub
4. Selecione o repositório: `relatorios-limpebras-semifull`

### 2. Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings > Environment Variables** e adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
NODE_ENV=production
```

### 3. Configurações de Build

A Vercel detectará automaticamente:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## ⚙️ Configurações Específicas

### Timeouts para PDFs
O arquivo `vercel.json` já está configurado com:
- **5 minutos** para APIs de PDF
- **1GB de memória** para geração de PDFs
- **Headers de segurança** configurados

### Domínio Personalizado (Opcional)
1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 🚀 Deploy Automático

### Via Git Push
```bash
git add .
git commit -m "feat: Nova funcionalidade"
git push origin master
```
**A Vercel fará deploy automaticamente!**

### Via CLI da Vercel
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📊 Monitoramento

### Logs
- **Vercel Dashboard**: Acesse os logs em tempo real
- **Funções**: Monitore performance das APIs
- **Analytics**: Veja métricas de uso

### Troubleshooting

#### Erro de Build
```bash
# Testar build localmente
npm run build

# Verificar logs na Vercel Dashboard
```

#### Erro de PDF
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o Supabase está configurado
- Verifique os logs da função na Vercel

## 🔒 Segurança

### Headers Configurados
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Cache Strategy
- **Estáticos**: Cache de 1 ano
- **APIs**: Sem cache (no-cache)

## 📈 Performance

### Otimizações Incluídas
- **Turbopack**: Build mais rápido
- **SWC**: Minificação otimizada
- **Image Optimization**: Automática
- **Code Splitting**: Automático

### Monitoring
- **Core Web Vitals**: Monitorados automaticamente
- **Real User Monitoring**: Disponível no plano Pro

## 🆘 Suporte

### Links Úteis
- [Documentação Vercel](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

### Contato
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **GitHub Issues**: Para bugs do projeto

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado à Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente
- [ ] Domínio configurado (opcional)
- [ ] Monitoramento ativo
- [ ] Backup das configurações

**🎉 Seu sistema está pronto para produção!**

