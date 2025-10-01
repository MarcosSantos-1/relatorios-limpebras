# Sistema de Relatórios e Upload de Documentos

Sistema completo para gestão de relatórios operacionais e upload simplificado de documentos para a nuvem.

## 🚀 Funcionalidades Principais

### 📋 Sistema de Relatórios
- **Acumuladores**: Gestão de ações de acumulador por sub-região
- **Eventos**: Controle de eventos e reuniões
- **Calendário**: Visualização integrada de atividades
- **Relatórios PDF**: Geração automática de relatórios

### 📁 Upload de Documentos
- **Upload Simples**: Envio direto para nuvem sem login
- **Múltiplos Formatos**: PDF, Excel, Word, Fotos/Imagens
- **Acesso Universal**: Disponível de qualquer dispositivo
- **Gestão Completa**: Download, visualização e remoção

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel

## ⚙️ Configuração Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Configurar Supabase
Execute o script SQL no Supabase:
```sql
-- Execute setup-supabase.sql para criar tabelas
-- Execute setup-upload-simples.sql para configurar uploads
```

### 4. Executar Projeto
```bash
npm run dev
```

## 📱 Como Usar

### Upload de Documentos
1. **Página Principal**: Clique em "Upload Simples de Documentos"
2. **Página Upload**: Acesse `/upload` diretamente
3. **Botão Novo**: Na aba "Documentos", clique em "Novo Documento"

### Gestão de Relatórios
1. **Selecione Data**: Clique no calendário
2. **Adicione Itens**: Use "Novo Acumulador" ou "Novo Evento"
3. **Visualize**: Veja atividades por data

## 🔧 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outros Provedores
- Configure as variáveis de ambiente
- Execute `npm run build`
- Sirva os arquivos estáticos

## 📋 Formatos Suportados

- **Documentos**: PDF, DOC, DOCX, TXT
- **Planilhas**: XLS, XLSX
- **Fotos/Imagens**: JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF
- **Tamanho máximo**: 50MB por arquivo

## 🔒 Segurança

- Uploads públicos (configurável)
- Autenticação opcional
- Validação de tipos de arquivo
- Sanitização de nomes de arquivo

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique as configurações do Supabase
2. Execute os scripts SQL necessários
3. Confirme as variáveis de ambiente

---

**Sistema pronto para produção!** 🚀