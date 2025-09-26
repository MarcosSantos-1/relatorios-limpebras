"use client";
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!file || !user) {
      setResult('Arquivo ou usuário não encontrado');
      return;
    }

    setUploading(true);
    setResult('Iniciando upload...');

    try {
      console.log('=== TESTE UPLOAD SIMPLES ===');
      console.log('Usuário:', user);
      console.log('Arquivo:', file);

      const fileRef = ref(storage, `test/${user.id}/${Date.now()}_${file.name}`);
      console.log('Referência criada:', fileRef.fullPath);

      const snapshot = await uploadBytes(fileRef, file);
      console.log('Upload concluído:', snapshot.metadata);

      const url = await getDownloadURL(snapshot.ref);
      console.log('URL obtida:', url);

      setResult(`✅ Upload bem-sucedido! URL: ${url}`);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setResult(`❌ Erro: ${error.code} - ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Teste Upload Firebase</h3>
      
      <div className="space-y-4">
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? 'Fazendo Upload...' : 'Testar Upload'}
        </button>

        {result && (
          <div className={`p-4 rounded ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
