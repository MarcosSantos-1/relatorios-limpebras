"use client";
import { useState } from 'react';
import { supabase, uploadFile, createDocument } from '@/lib/supabase';

export default function SupabaseTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      setResult(`❌ Erro no cadastro: ${error.message}`);
    } else {
      setResult(`✅ Cadastro realizado! Verifique seu email: ${data.user?.email}`);
    }
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setResult(`❌ Erro no login: ${error.message}`);
    } else {
      setResult(`✅ Login realizado! Usuário: ${data.user?.email}`);
      setUser(data.user);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setResult(`❌ Erro no logout: ${error.message}`);
    } else {
      setResult('✅ Logout realizado!');
      setUser(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setResult('Arquivo ou usuário não encontrado');
      return;
    }

    setUploading(true);
    setResult('Iniciando upload...');

    try {
      console.log('=== TESTE UPLOAD SUPABASE ===');
      console.log('Usuário:', user);
      console.log('Arquivo:', file);

      // Upload do arquivo
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, publicUrl } = await uploadFile(
        'documentos',
        `${user.id}/${fileName}`,
        file
      );

      console.log('Upload concluído:', uploadData);
      console.log('URL pública:', publicUrl);

      // Salvar no banco de dados
      const documentData = {
        nome: file.name,
        tipo: file.name.endsWith('.pdf') ? 'PDF' : 'EXCEL',
        categoria: 'OUTROS',
        url: publicUrl,
        tamanho: file.size,
        user_id: user.id,
        tags: ['teste']
      };

      const document = await createDocument(documentData);
      console.log('Documento salvo:', document);

      setResult(`✅ Upload bem-sucedido! URL: ${publicUrl}`);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setResult(`❌ Erro: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-6">
      <h3 className="text-lg font-semibold">Teste Supabase</h3>
      
      {/* Autenticação */}
      <div className="space-y-4">
        <h4 className="font-medium">Autenticação</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="sua senha"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSignUp}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Cadastrar
          </button>
          <button
            onClick={handleSignIn}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Login
          </button>
          {user && (
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
        {user && (
          <div className="p-3 bg-green-100 text-green-800 rounded">
            ✅ Logado como: {user.email}
          </div>
        )}
      </div>

      {/* Upload */}
      {user && (
        <div className="space-y-4">
          <h4 className="font-medium">Upload de Arquivo</h4>
          <div>
            <label className="block text-sm font-medium mb-2">Arquivo:</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            {uploading ? 'Fazendo Upload...' : 'Testar Upload Supabase'}
          </button>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className={`p-4 rounded ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
