import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Documento } from '@/lib/types';

export function useSupabaseDocuments() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando documentos no Supabase...');
      
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar documentos:', error);
        throw error;
      }

      console.log('✅ Documentos encontrados:', data);
      
      // Converter dados do Supabase para o formato esperado
      const documentosFormatados = data?.map(doc => ({
        id: doc.id,
        nome: doc.nome,
        tipo: doc.tipo,
        categoria: doc.categoria || 'OUTROS',
        descricao: doc.descricao,
        url: doc.url,
        tamanho: doc.tamanho || 0,
        userId: doc.user_id,
        tags: doc.tags || [],
        createdAt: doc.created_at ? new Date(doc.created_at).getTime() : Date.now(),
        updatedAt: doc.updated_at ? new Date(doc.updated_at).getTime() : Date.now(),
      })) || [];

      setDocumentos(documentosFormatados);
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar documentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDocumento = async (documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('💾 Salvando documento no Supabase...', documento);
      
      // Verificar se usuário está logado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      const documentoData = {
        nome: documento.nome,
        tipo: documento.tipo,
        categoria: documento.categoria || 'OUTROS',
        descricao: documento.descricao,
        url: documento.url,
        tamanho: documento.tamanho,
        user_id: user.id, // Usar o ID real do usuário
        tags: documento.tags || [],
      };

      console.log('📋 Dados para inserir:', documentoData);

      const { data, error } = await supabase
        .from('documentos')
        .insert([documentoData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar documento:', error);
        throw error;
      }

      console.log('✅ Documento salvo com sucesso:', data);
      
      // Recarregar lista de documentos
      await fetchDocumentos();
      
      return data.id;
      
    } catch (err: any) {
      console.error('❌ Erro ao adicionar documento:', err);
      throw err;
    }
  };

  const updateDocumento = async (id: string, documento: Partial<Documento>) => {
    try {
      console.log('🔄 Atualizando documento:', id, documento);
      
      const documentoData = {
        nome: documento.nome,
        tipo: documento.tipo,
        categoria: documento.categoria,
        descricao: documento.descricao,
        url: documento.url,
        tamanho: documento.tamanho,
        tags: documento.tags,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('documentos')
        .update(documentoData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar documento:', error);
        throw error;
      }

      console.log('✅ Documento atualizado:', data);
      
      // Recarregar lista de documentos
      await fetchDocumentos();
      
      return data.id;
      
    } catch (err: any) {
      console.error('❌ Erro ao atualizar documento:', err);
      throw err;
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      console.log('🗑️ Deletando documento:', id);
      
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar documento:', error);
        throw error;
      }

      console.log('✅ Documento deletado com sucesso');
      
      // Recarregar lista de documentos
      await fetchDocumentos();
      
    } catch (err: any) {
      console.error('❌ Erro ao deletar documento:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, []);

  return {
    documentos,
    loading,
    error,
    addDocumento,
    updateDocumento,
    deleteDocumento,
    refetch: fetchDocumentos,
  };
}
