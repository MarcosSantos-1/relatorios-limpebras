# Upload Simples de Documentos

Sistema de upload simplificado que permite enviar documentos diretamente para o Supabase Storage sem necessidade de autenticação.

## 🚀 Funcionalidades

- ✅ Upload direto para nuvem (Supabase Storage)
- ✅ Sem necessidade de login/autenticação
- ✅ Suporte a múltiplos formatos (PDF, Excel, Word, Fotos/Imagens)
- ✅ Drag & Drop ou clique para selecionar
- ✅ Lista de documentos enviados
- ✅ Download direto dos arquivos (nova aba)
- ✅ Botão de remover documentos
- ✅ Tratamento de caracteres especiais nos nomes
- ✅ Upload apenas por botão (modal)
- ✅ Acesso de qualquer dispositivo

## 📁 Arquivos Criados

1. **`components/SimpleUpload.tsx`** - Componente principal de upload
2. **`app/upload/page.tsx`** - Página dedicada para uploads
3. **`setup-upload-simples.sql`** - Script SQL para configurar políticas

## ⚙️ Configuração do Supabase

### 1. Executar Script SQL

Execute o arquivo `setup-upload-simples.sql` no SQL Editor do Supabase:

```sql
-- Remove políticas restritivas
DROP POLICY IF EXISTS "Users can view own documents" ON documentos;
-- ... (resto do script)
```

### 2. Configurar Storage Bucket

No Dashboard do Supabase:

1. Vá para **Storage** → **Buckets**
2. Certifique-se que existe um bucket chamado `documentos`
3. Se não existir, crie um novo bucket:
   - Nome: `documentos`
   - Público: ✅ **Sim**
4. Configure as políticas do bucket:
   - **SELECT**: `public`, `authenticated`, `anon`
   - **INSERT**: `public`, `authenticated`, `anon`
   - **UPDATE**: `public`, `authenticated`, `anon`
   - **DELETE**: `public`, `authenticated`, `anon`

### 3. Verificar Configurações

- ✅ Bucket `documentos` existe e é público
- ✅ Políticas do banco permitem acesso sem autenticação
- ✅ Políticas do storage permitem upload/download público

## 🎯 Como Usar

### Acesso Direto
- URL: `http://localhost:3000/upload` (desenvolvimento)
- URL: `https://seu-dominio.com/upload` (produção)

### A partir da Home
- Clique no botão "Upload Simples de Documentos" na página principal

## 📋 Formatos Suportados

- **Documentos**: PDF, DOC, DOCX, TXT
- **Planilhas**: XLS, XLSX
- **Fotos/Imagens**: JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF
- **Tamanho máximo**: 50MB por arquivo

## 🔧 Personalização

### Modificar Formatos Aceitos
Edite o componente `SimpleUpload.tsx`:

```tsx
accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.jpg,.jpeg,.png"
```

### Alterar Tamanho Máximo
```tsx
if (file.size > 50 * 1024 * 1024) { // 50MB limit
```

### Modificar Categoria Padrão
```tsx
categoria: 'OUTROS', // ou outra categoria
```

## 🛠️ Troubleshooting

### Erro: "Bucket não encontrado"
- Verifique se o bucket `documentos` existe no Supabase Storage
- Certifique-se que o nome está correto (case-sensitive)

### Erro: "Política de acesso negada"
- Execute o script `setup-upload-simples.sql`
- Verifique as políticas do bucket no Storage

### Erro: "Arquivo muito grande"
- Reduza o tamanho do arquivo ou aumente o limite no código
- Verifique limites do Supabase Storage

### Upload não aparece na lista
- Verifique se as políticas do banco permitem SELECT público
- Confirme que o `refetch()` está sendo chamado após upload

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🔒 Segurança

⚠️ **Atenção**: Este sistema permite uploads públicos. Para ambientes de produção, considere:
- Implementar rate limiting
- Adicionar validação de tipos de arquivo mais rigorosa
- Configurar políticas mais restritivas se necessário

## 🚀 Deploy

Para fazer deploy em produção:

1. Configure as variáveis de ambiente do Supabase
2. Execute o script SQL no Supabase de produção
3. Configure o bucket de storage como público
4. Teste o upload em ambiente de produção

---

**Pronto!** Seu sistema de upload simplificado está funcionando. Os usuários podem agora enviar documentos diretamente para a nuvem sem necessidade de login.
