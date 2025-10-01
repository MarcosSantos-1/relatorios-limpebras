"use client";
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';

interface SimpleUploadProps {
  onUploadComplete?: (url: string, fileName: string) => void;
}

export default function SimpleUpload({ onUploadComplete }: SimpleUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      toast.success('Arquivo selecionado!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      toast.success('Arquivo selecionado!');
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);
    
    try {
      console.log('🚀 Iniciando upload simplificado...');
      
      // Criar nome único para o arquivo com tratamento de caracteres especiais
      const timestamp = Date.now();
      // Remover caracteres especiais e espaços do nome do arquivo
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Substituir caracteres especiais por _
        .replace(/_+/g, '_') // Remover múltiplos _ consecutivos
        .replace(/^_|_$/g, ''); // Remover _ do início e fim
      
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `uploads/${fileName}`;
      
      console.log('📂 Caminho do arquivo:', filePath);
      
      // Upload para Supabase Storage (bucket público)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      
      console.log('✅ Upload concluído:', uploadData);
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);
      
      console.log('🔗 URL pública:', publicUrl);
      
        // Salvar informações do documento na tabela (sem autenticação)
        const documentoData = {
          nome: file.name,
          tipo: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 
                file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/) ? 'IMAGEM' : 'EXCEL',
          categoria: 'OUTROS',
          descricao: `Upload simplificado - ${new Date().toLocaleString('pt-BR')}`,
          url: publicUrl,
          tamanho: file.size,
          user_id: null, // Sem autenticação
          tags: ['upload-simples'],
        };

      const { error: dbError } = await supabase
        .from('documentos')
        .insert([documentoData]);

      if (dbError) {
        console.warn('⚠️ Erro ao salvar no banco (mas upload foi feito):', dbError);
        // Não falha o upload se der erro no banco
      }
      
      toast.success('Arquivo enviado com sucesso!');
      
      if (onUploadComplete) {
        onUploadComplete(publicUrl, file.name);
      }
      
      // Limpar arquivo após upload
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      toast.error(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
        📁 Upload Simples de Documentos
      </h2>
      
      <div className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          className={`relative w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
              : 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 hover:border-indigo-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-12 h-12 mb-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              <span className="font-medium">Clique para selecionar</span><br />
              ou arraste e solte o arquivo aqui
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
              PDF, Excel, Word, Fotos/Imagens (máx. 50MB)
            </p>
          </div>
        </div>

        {/* File Info */}
        {file && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-green-600 dark:text-green-400 text-2xl">
                  {file.name.toLowerCase().endsWith('.pdf') ? '📄' : 
                   file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? '📊' :
                   file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') ? '📝' :
                   file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/) ? '🖼️' : '📁'}
                </span>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{file.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={uploadFile}
          disabled={!file || uploading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Enviar Arquivo
            </>
          )}
        </button>

        {/* Info */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          <p>✅ Upload direto para nuvem</p>
          <p>✅ Sem necessidade de login</p>
          <p>✅ Acesso de qualquer dispositivo</p>
        </div>
      </div>
    </div>
  );
}
