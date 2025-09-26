"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseSetup() {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const setupDatabase = async () => {
    setSetupStatus('running');
    setLogs([]);
    setError('');

    try {
      addLog('🚀 Iniciando configuração do banco de dados...');

      // 1. Criar tabela de documentos
      addLog('📄 Criando tabela documentos...');
      const { error: docError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS documentos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nome TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK (tipo IN ('PDF', 'EXCEL')),
            categoria TEXT DEFAULT 'OUTROS',
            descricao TEXT,
            url TEXT,
            tamanho BIGINT,
            user_id UUID REFERENCES auth.users(id),
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (docError) {
        // Tentar método alternativo
        addLog('⚠️ Método RPC falhou, tentando query direta...');
        const { error: directError } = await supabase
          .from('documentos')
          .select('id')
          .limit(1);
        
        if (directError && directError.message.includes('relation "documentos" does not exist')) {
          addLog('❌ Tabela documentos não existe. Execute o script SQL manualmente.');
          setError('Tabela documentos não existe. Execute o script setup-supabase.sql no SQL Editor do Supabase.');
          setSetupStatus('error');
          return;
        }
      } else {
        addLog('✅ Tabela documentos criada com sucesso!');
      }

      // 2. Criar tabela de anotações
      addLog('📝 Criando tabela anotacoes...');
      const { error: anotError } = await supabase
        .from('anotacoes')
        .select('id')
        .limit(1);

      if (anotError && anotError.message.includes('relation "anotacoes" does not exist')) {
        addLog('❌ Tabela anotacoes não existe.');
      } else {
        addLog('✅ Tabela anotacoes OK!');
      }

      // 3. Testar conexão
      addLog('🔗 Testando conexão...');
      const { data, error: testError } = await supabase
        .from('documentos')
        .select('count')
        .limit(1);

      if (testError) {
        addLog(`❌ Erro na conexão: ${testError.message}`);
        setError(testError.message);
        setSetupStatus('error');
      } else {
        addLog('✅ Conexão com banco de dados OK!');
        addLog('✅ Configuração concluída com sucesso!');
        setSetupStatus('success');
      }

    } catch (err: any) {
      addLog(`❌ Erro geral: ${err.message}`);
      setError(err.message);
      setSetupStatus('error');
    }
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/rzurwjixlqremctcpwhk', '_blank');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold">Configuração do Banco de Dados</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Configuração Necessária
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            O banco de dados precisa ser configurado antes de usar o sistema. Execute os scripts SQL no Supabase.
          </p>
          <button
            onClick={openSupabaseDashboard}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
          >
            Abrir Supabase Dashboard
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={setupDatabase}
            disabled={setupStatus === 'running'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {setupStatus === 'running' ? '⏳ Configurando...' : '🚀 Configurar Banco de Dados'}
          </button>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            Execute o arquivo <code>setup-supabase.sql</code> no SQL Editor do Supabase primeiro.
          </p>
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📋 Logs de Configuração:</h4>
            <div className="space-y-1 text-sm font-mono">
              {logs.map((log, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Erro:</h4>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {setupStatus === 'success' && (
          <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Sucesso!</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Banco de dados configurado com sucesso! Você pode agora usar o sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
