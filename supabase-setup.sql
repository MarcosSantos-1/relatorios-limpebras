-- Script SQL para configuração do Supabase
-- Execute este script no editor SQL do Supabase

-- 1. Criar tabela documentos
CREATE TABLE IF NOT EXISTS documentos (
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

-- 2. Habilitar Row Level Security
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para acesso público
-- Política para leitura pública
CREATE POLICY "Permitir leitura pública de documentos" ON documentos
  FOR SELECT USING (true);

-- Política para inserção pública
CREATE POLICY "Permitir inserção pública de documentos" ON documentos
  FOR INSERT WITH CHECK (true);

-- Política para atualização pública
CREATE POLICY "Permitir atualização pública de documentos" ON documentos
  FOR UPDATE USING (true);

-- Política para exclusão pública
CREATE POLICY "Permitir exclusão pública de documentos" ON documentos
  FOR DELETE USING (true);

-- 4. Configurar Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Criar políticas para Storage
-- Política para upload público
CREATE POLICY "Permitir upload público" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Política para leitura pública
CREATE POLICY "Permitir leitura pública storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Política para exclusão pública
CREATE POLICY "Permitir exclusão pública storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads');

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar trigger para atualizar updated_at
CREATE TRIGGER update_documentos_updated_at 
    BEFORE UPDATE ON documentos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_created_at ON documentos(created_at);

-- 9. Verificar configuração
SELECT 'Configuração concluída com sucesso!' as status;
