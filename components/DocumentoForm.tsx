"use client";
import { useState } from 'react';
import { Documento } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface DocumentoFormProps {
  documento?: Documento | null;
  onSubmit: (documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function DocumentoForm({ documento, onSubmit, onCancel }: DocumentoFormProps) {
  const { user } = useAuth();
  const [nome, setNome] = useState(documento?.nome || '');
  const [tipo, setTipo] = useState<'PDF' | 'EXCEL'>(documento?.tipo || 'PDF');
  const [categoria, setCategoria] = useState<'TEMPLATE_BALANCO' | 'GUIA' | 'MEMORIAL_DESCRITIVO' | 'OUTROS'>(documento?.categoria || 'OUTROS');
  const [descricao, setDescricao] = useState(documento?.descricao || '');
  const [tags, setTags] = useState(documento?.tags?.join(', ') || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const categorias = {
    'TEMPLATE_BALANCO': 'Template de Balanço',
    'GUIA': 'Guia',
    'MEMORIAL_DESCRITIVO': 'Memorial Descritivo',
    'OUTROS': 'Outros'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nome.trim()) return;

    setUploading(true);

    try {
      let url = documento?.url || '';
      let tamanho = documento?.tamanho || 0;

      // Se há um novo arquivo, fazer upload
      if (file) {
        console.log('Iniciando upload do arquivo:', file.name);
        const fileRef = ref(storage, `documentos/${user.id}/${Date.now()}_${file.name}`);
        console.log('Referência do arquivo criada:', fileRef.fullPath);
        
        try {
          const snapshot = await uploadBytes(fileRef, file);
          console.log('Upload concluído:', snapshot);
          url = await getDownloadURL(snapshot.ref);
          console.log('URL obtida:', url);
          tamanho = file.size;
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw uploadError;
        }
      }

      onSubmit({
        nome: nome.trim(),
        tipo,
        categoria,
        descricao: descricao.trim() || undefined,
        url,
        tamanho,
        userId: user.id,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo');
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

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          {documento ? 'Editar Documento' : 'Novo Documento'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nome do Documento *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Template Balanço Mensal"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'PDF' | 'EXCEL')}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PDF">PDF</option>
                <option value="EXCEL">Excel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Categoria *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(categorias).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o conteúdo do documento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: template, balanço, mensal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Arquivo {!documento && '*'}
            </label>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!documento}
            />
            {documento && documento.url && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Arquivo atual: {documento.nome} ({formatFileSize(documento.tamanho)})
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading || !nome.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {uploading ? 'Salvando...' : (documento ? 'Atualizar' : 'Salvar')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-500 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
    </div>
  );
}
