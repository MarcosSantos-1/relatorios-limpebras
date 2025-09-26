"use client";
import { useState } from 'react';
import SimpleUpload from '@/components/SimpleUpload';
import { useSupabaseDocuments } from '@/lib/hooks/useSupabaseDocuments';
import { toast } from 'react-toastify';

export default function UploadPage() {
  const { documentos, refetch, deleteDocumento } = useSupabaseDocuments();
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = async (url: string, fileName: string) => {
    console.log('Upload concluído:', { url, fileName });
    // Recarregar lista de documentos
    await refetch();
    setShowUpload(false);
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await deleteDocumento(id);
        toast.success('Documento removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover documento');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Upload Simples de Documentos
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-lg">
            Envie seus documentos diretamente para a nuvem
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Button */}
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Enviar Documento
            </button>
          </div>

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Upload de Documento
                    </h2>
                    <button
                      onClick={() => setShowUpload(false)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <SimpleUpload onUploadComplete={handleUploadComplete} />
                </div>
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
            <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                📁 Documentos Enviados
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {documentos.length} documento(s) encontrado(s)
              </p>
            </div>

            <div className="p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">
              {documentos.length > 0 ? (
                <div className="space-y-3">
                  {documentos.map(doc => (
                    <div
                      key={doc.id}
                      className="border border-zinc-200 dark:border-zinc-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {doc.tipo === 'PDF' ? '📄' : doc.tipo === 'IMAGEM' ? '🖼️' : '📊'}
                            </span>
                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{doc.nome}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.tipo === 'PDF' ? 'bg-red-100 text-red-800' : 
                              doc.tipo === 'IMAGEM' ? 'bg-purple-100 text-purple-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {doc.tipo}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            {doc.descricao || 'Sem descrição'}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {doc.categoria.replace('_', ' ')}
                            </span>
                            {doc.tags?.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-zinc-100 text-zinc-800 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                            Enviado em: {new Date(doc.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.url;
                              link.download = doc.nome;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Abrir
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <div className="text-4xl mb-2">📁</div>
                  <p>Nenhum documento encontrado</p>
                  <p className="text-sm mt-1">Envie seu primeiro arquivo usando o formulário acima</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              💡 Como usar
            </h3>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>• <strong>Arraste e solte</strong> ou <strong>clique</strong> para selecionar arquivos</p>
              <p>• Formatos suportados: PDF, Excel, Word, Fotos/Imagens</p>
              <p>• Tamanho máximo: 50MB por arquivo</p>
              <p>• Os arquivos ficam disponíveis na nuvem permanentemente</p>
              <p>• Acesse de qualquer dispositivo usando este link</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
