"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StorageTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (!user) {
      setResult('❌ Usuário não está logado. Faça login primeiro.');
      return false;
    }
    
    setResult(`✅ Usuário logado: ${user.email}`);
    return true;
  };

  const testStorage = async () => {
    if (!file) {
      setResult('❌ Selecione um arquivo primeiro');
      return;
    }

    const isAuth = await checkAuth();
    if (!isAuth) return;

    setUploading(true);
    setResult('🔄 Testando upload...');

    try {
      console.log('=== TESTE STORAGE DIRETO ===');
      console.log('Usuário:', user);
      console.log('Arquivo:', file);

      // Criar nome único para o arquivo
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Caminho do arquivo:', filePath);

      // Upload direto
      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (error) {
        console.error('Erro no upload:', error);
        setResult(`❌ Erro no upload: ${error.message}`);
        return;
      }

      console.log('Upload bem-sucedido:', data);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      console.log('URL pública:', publicUrl);

      setResult(`✅ Upload bem-sucedido!
📁 Arquivo: ${file.name}
📊 Tamanho: ${file.size} bytes
🔗 URL: ${publicUrl}`);

    } catch (err: any) {
      console.error('Erro geral:', err);
      setResult(`❌ Erro geral: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const createBucket = async () => {
    try {
      setResult('🔄 Criando bucket...');
      
      // Tentar criar bucket via API (pode não funcionar)
      const { data, error } = await supabase.storage.createBucket('documentos', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (error) {
        console.log('Bucket pode já existir:', error.message);
        setResult('ℹ️ Bucket já existe ou erro na criação. Continue com o teste.');
      } else {
        setResult('✅ Bucket criado com sucesso!');
      }
    } catch (err: any) {
      setResult(`ℹ️ Erro ao criar bucket: ${err.message}. Bucket pode já existir.`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold">Teste de Storage Supabase</h3>
      
      <div className="space-y-4">
        {/* Verificar autenticação */}
        <div>
          <button
            onClick={checkAuth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Verificar Autenticação
          </button>
          {user && (
            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm">
              ✅ {user.email}
            </div>
          )}
        </div>

        {/* Criar bucket */}
        <div>
          <button
            onClick={createBucket}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Criar Bucket (Opcional)
          </button>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Arquivo para teste:</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
            accept=".pdf,.xlsx,.xls"
          />
        </div>

        <button
          onClick={testStorage}
          disabled={!file || uploading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {uploading ? '🔄 Fazendo Upload...' : '🚀 Testar Upload'}
        </button>

        {/* Resultado */}
        {result && (
          <div className={`p-4 rounded text-sm whitespace-pre-line ${
            result.includes('✅') ? 'bg-green-100 text-green-800' : 
            result.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {result}
          </div>
        )}

        {/* Instruções */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Instruções:</strong></p>
          <p>1. Verifique se está logado</p>
          <p>2. Execute o script setup-storage-simple.sql no Supabase</p>
          <p>3. Selecione um arquivo e teste o upload</p>
          <p>4. Verifique o console (F12) para logs detalhados</p>
        </div>
      </div>
    </div>
  );
}
