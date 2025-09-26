"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('=== TESTE CONEXÃO SUPABASE ===');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      // Testar conexão básica
      const { data, error } = await supabase.from('documentos').select('count').limit(1);
      
      if (error) {
        console.error('Erro na conexão:', error);
        setError(`Erro: ${error.message}`);
        setConnectionStatus('error');
      } else {
        console.log('✅ Conexão com banco de dados OK');
        setConnectionStatus('success');
      }

      // Verificar usuário atual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        console.log('✅ Usuário logado:', currentUser.email);
      } else {
        console.log('ℹ️ Nenhum usuário logado');
      }

    } catch (err: any) {
      console.error('Erro geral:', err);
      setError(`Erro geral: ${err.message}`);
      setConnectionStatus('error');
    }
  };

  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'teste@exemplo.com',
        password: 'senha123456'
      });
      
      if (error) {
        console.error('Erro no cadastro:', error);
        setError(`Erro no cadastro: ${error.message}`);
      } else {
        console.log('✅ Teste de cadastro OK:', data);
        setError('');
      }
    } catch (err: any) {
      console.error('Erro no teste de auth:', err);
      setError(`Erro no teste de auth: ${err.message}`);
    }
  };

  const testStorage = async () => {
    try {
      // Criar um arquivo de teste
      const testFile = new File(['teste'], 'teste.txt', { type: 'text/plain' });
      
      const { data, error } = await supabase.storage
        .from('documentos')
        .upload('test/teste.txt', testFile);
      
      if (error) {
        console.error('Erro no storage:', error);
        setError(`Erro no storage: ${error.message}`);
      } else {
        console.log('✅ Teste de storage OK:', data);
        setError('');
      }
    } catch (err: any) {
      console.error('Erro no teste de storage:', err);
      setError(`Erro no teste de storage: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold">Teste de Conexão Supabase</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status da Conexão:</span>
          {connectionStatus === 'testing' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
              🔄 Testando...
            </span>
          )}
          {connectionStatus === 'success' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              ✅ Conectado
            </span>
          )}
          {connectionStatus === 'error' && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
              ❌ Erro
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado'}</p>
          <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}</p>
        </div>

        {user && (
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            ✅ Usuário logado: {user.email}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Testar Conexão
          </button>
          <button
            onClick={testAuth}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Testar Auth
          </button>
          <button
            onClick={testStorage}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Testar Storage
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Verifique o console do navegador (F12) para logs detalhados.</p>
        </div>
      </div>
    </div>
  );
}
