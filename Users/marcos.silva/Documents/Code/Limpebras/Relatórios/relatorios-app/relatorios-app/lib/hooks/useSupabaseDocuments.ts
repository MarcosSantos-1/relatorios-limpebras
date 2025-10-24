// Hook temporário para substituir useSupabaseDocuments
import { useState, useEffect } from 'react';

export function useSupabaseDocuments() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = async () => {
    setLoading(true);
    // Por enquanto retorna array vazio
    setDocumentos([]);
    setLoading(false);
  };

  const deleteDocumento = async (id: string) => {
    console.log('Deletando documento:', id);
    // Por enquanto não faz nada
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    documentos,
    loading,
    refetch,
    deleteDocumento
  };
}
