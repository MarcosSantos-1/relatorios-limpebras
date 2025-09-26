"use client";
import { useState, useRef } from 'react';
import { Documento } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

interface DocumentoFormV2Props {
  documento?: Documento | null;
  onSubmit: (documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function DocumentoFormV2({ documento, onSubmit, onCancel }: DocumentoFormV2Props) {
  const { user } = useAuth();
  const [nome, setNome] = useState(documento?.nome || '');
  const [tipo, setTipo] = useState<'PDF' | 'EXCEL'>(documento?.tipo || 'PDF');
  const [descricao, setDescricao] = useState(documento?.descricao || '');
  const [tags, setTags] = useState(documento?.tags?.join(', ') || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nome.trim()) {
      toast.error('Nome do documento é obrigatório');
      return;
    }

    if (!file && !documento?.url) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);
    console.log('Iniciando processo de salvamento...');

    try {
      let url = documento?.url || '';
      let tamanho = documento?.tamanho || 0;

      // Se há um novo arquivo, fazer upload
      if (file) {
        console.log('Arquivo selecionado:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        const fileRef = ref(storage, `documentos/${user.id}/${Date.now()}_${file.name}`);
        console.log('Referência do arquivo criada:', fileRef.fullPath);
        
        try {
          console.log('=== INICIANDO UPLOAD PARA FIREBASE STORAGE ===');
          console.log('Usuário:', { id: user.id, email: user.email });
          console.log('Arquivo:', { name: file.name, size: file.size, type: file.type });
          console.log('Caminho no Storage:', fileRef.fullPath);
          
          // Verificar autenticação
          if (!user.id) {
            throw new Error('Usuário não autenticado');
          }
          
          // Verificar arquivo
          if (file.size === 0) {
            throw new Error('Arquivo está vazio');
          }
          
          if (file.size > 50 * 1024 * 1024) {
            throw new Error('Arquivo muito grande (máximo 50MB)');
          }
          
          console.log('Iniciando upload...');
          const snapshot = await uploadBytes(fileRef, file);
          console.log('Upload concluído:', {
            ref: snapshot.ref.fullPath,
            bytesTransferred: snapshot.metadata.size,
            contentType: snapshot.metadata.contentType
          });
          
          console.log('Obtendo URL de download...');
          url = await getDownloadURL(snapshot.ref);
          console.log('URL obtida:', url);
          tamanho = file.size;
          
          console.log('=== UPLOAD PARA STORAGE CONCLUÍDO ===');
        } catch (uploadError: any) {
          console.error('=== ERRO NO UPLOAD ===');
          console.error('Tipo:', uploadError.constructor?.name || 'Unknown');
          console.error('Código:', uploadError.code);
          console.error('Mensagem:', uploadError.message);
          console.error('Stack:', uploadError.stack);
          throw uploadError;
        }
      }

      const documentoData = {
        nome: nome.trim(),
        tipo,
        categoria: 'OUTROS' as const,
        descricao: descricao.trim() || undefined,
        url,
        tamanho,
        userId: user.id,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      };

      console.log('Dados do documento:', documentoData);
      console.log('Chamando onSubmit...');

      await onSubmit(documentoData);

      console.log('onSubmit concluído com sucesso');
      toast.success('Documento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error(`Erro ao fazer upload do arquivo: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

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
      
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(droppedFile.type)) {
        toast.error('Tipo de arquivo não permitido. Use PDF ou Excel.');
        return;
      }

      setFile(droppedFile);
      
      // Auto-detect tipo baseado na extensão
      if (droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setTipo('PDF');
      } else if (droppedFile.name.toLowerCase().endsWith('.xlsx') || droppedFile.name.toLowerCase().endsWith('.xls')) {
        setTipo('EXCEL');
      }
      
      toast.success('Arquivo adicionado com sucesso!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Tipo de arquivo não permitido. Use PDF ou Excel.');
        return;
      }

      setFile(selectedFile);
      
      // Auto-detect tipo baseado na extensão
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setTipo('PDF');
      } else if (selectedFile.name.toLowerCase().endsWith('.xlsx') || selectedFile.name.toLowerCase().endsWith('.xls')) {
        setTipo('EXCEL');
      }
      
      toast.success('Arquivo selecionado com sucesso!');
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
        {documento ? 'Editar Documento' : 'Novo Documento'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Nome do Documento *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            placeholder="Ex: Template Balanço Mensal"
            required
          />
        </div>


        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            placeholder="Descreva o conteúdo do documento..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Tags (separadas por vírgula)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            placeholder="Ex: template, balanço, mensal"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Arquivo {!documento && '*'}</label>
          
          {/* Drag and Drop Area */}
          <div
            className={`relative w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
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
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              required={!documento}
            />
            
            <div className="flex flex-col items-center justify-center h-full pt-5 pb-6">
              <svg className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                <span className="font-medium">Clique para selecionar</span><br />
                ou arraste e solte o arquivo aqui
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                PDF ou Excel (máx. 10MB)
              </p>
            </div>
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">
                    {tipo === 'PDF' ? '📄' : '📊'}
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {documento && documento.url && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">
                  {documento.tipo === 'PDF' ? '📄' : '📊'}
                </span>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{documento.nome}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{formatFileSize(documento.tamanho)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={uploading || !nome.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {documento ? 'Atualizar' : 'Salvar'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
