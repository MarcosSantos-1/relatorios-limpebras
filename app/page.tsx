"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import AcumuladorForm from '@/components/AcumuladorForm';
import EventoForm from '@/components/EventoForm';
import DocumentoFormSupabase from '@/components/DocumentoFormSupabase';
import SimpleUpload from '@/components/SimpleUpload';
import { useAcumuladores, useEventos, useFechamentos } from '@/lib/hooks/useFirebase';
import { useSupabaseDocuments } from '@/lib/hooks/useSupabaseDocuments';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Acumulador, Evento, Documento, SUB_REGIOES } from '@/lib/types';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  
  const { acumuladores, addAcumulador, updateAcumulador, deleteAcumulador, error: acumuladorError } = useAcumuladores();
  const { eventos, addEvento, updateEvento, deleteEvento } = useEventos();
  const { fechamentos } = useFechamentos();
  const { documentos: supabaseDocumentos, addDocumento: addSupabaseDocumento, updateDocumento: updateSupabaseDocumento, deleteDocumento: deleteSupabaseDocumento } = useSupabaseDocuments();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState<'acumuladores' | 'eventos' | 'documentos'>('acumuladores');
  const [showForm, setShowForm] = useState(false);
  const [showSimpleUpload, setShowSimpleUpload] = useState(false);
  const [editingItem, setEditingItem] = useState<Acumulador | Evento | Documento | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddNew = () => {
    if (activeTab === 'documentos') {
      setShowSimpleUpload(true);
    } else {
      setEditingItem(null);
      setShowForm(true);
    }
  };

  const handleSimpleUploadComplete = async (url: string, fileName: string) => {
    console.log('Upload concluído:', { url, fileName });
    setShowSimpleUpload(false);
    // Recarregar lista de documentos
    window.location.reload();
  };

  const handleEdit = (item: Acumulador | Evento | Documento) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        if (activeTab === 'acumuladores') {
          await updateAcumulador(editingItem.id, data as Acumulador);
        } else if (activeTab === 'eventos') {
          await updateEvento(editingItem.id, data as Evento);
        } else if (activeTab === 'documentos') {
          await updateSupabaseDocumento(editingItem.id, data as Documento);
        }
      } else {
        if (activeTab === 'acumuladores') {
          await addAcumulador(data as Acumulador);
        } else if (activeTab === 'eventos') {
          await addEvento(data as Evento);
        } else if (activeTab === 'documentos') {
          await addSupabaseDocumento(data as Documento);
        }
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        if (activeTab === 'acumuladores') {
          await deleteAcumulador(id);
        } else if (activeTab === 'eventos') {
          await deleteEvento(id);
        } else if (activeTab === 'documentos') {
          await deleteSupabaseDocumento(id);
        }
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizado': return 'bg-green-100 text-green-800';
      case 'aguardando_descarga': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'nao_comecou': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'evento': return 'bg-blue-100 text-blue-800';
      case 'reuniao': return 'bg-purple-100 text-purple-800';
      case 'outros': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Função para converter data sem problemas de fuso horário
  const parseDate = (dateString: string | Date) => {
    if (dateString instanceof Date) return dateString;
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  };

  const filteredItems = () => {
    if (activeTab === 'documentos') {
      return supabaseDocumentos; // Documentos não dependem de data
    }
    
    if (!selectedDate) return [];
    
    if (activeTab === 'acumuladores') {
      return acumuladores.filter(acumulador => isSameDay(parseDate(acumulador.dia), selectedDate));
    } else if (activeTab === 'eventos') {
      return eventos.filter(evento => isSameDay(parseDate(evento.dia), selectedDate));
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header com design simplificado */}
        <div className="mb-8 text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Planejamento e Organização
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-lg">
            Sistema de gestão de documentos e planejamento
          </p>
          
          {/* Quick Upload Link */}
          <div className="mt-6">
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Simples de Documentos
            </a>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Envie documentos diretamente para a nuvem sem login
            </p>
          </div>
          
          {/* Alerta de erro do Firebase */}
          {acumuladorError && (
            <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Erro de Conexão com Firebase</p>
                  <p className="text-sm mt-1">
                    {acumuladorError || 'Erro de conexão'}
                  </p>
                  <p className="text-sm mt-1">
                    <a href="/SOLUCAO_FIREBASE.md" className="underline hover:no-underline" target="_blank">
                      Clique aqui para ver a solução
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Calendário */}
          <div className="mb-8">
            <Calendar
              acumuladores={acumuladores}
              eventos={eventos}
              fechamentos={fechamentos}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>

          {/* Layout principal */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Lista de itens - ocupando mais espaço */}
            <div className="xl:col-span-3">
              <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
                {/* Tabs com design simplificado */}
                <div className="border-b border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { key: 'acumuladores', label: 'Acumuladores', icon: '📋' },
                      { key: 'eventos', label: 'Eventos', icon: '🎪' },
                      { key: 'documentos', label: 'Documentos', icon: '📁' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as 'acumuladores' | 'eventos' | 'documentos')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.key
                            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                            : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Conteúdo das tabs */}
                <div className="p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">
                {activeTab === 'documentos' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">📁 Documentos</h3>
                      <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                      >
                        <span className="mr-2">📄</span>
                        Novo Documento
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {supabaseDocumentos.map(doc => (
                        <div
                          key={doc.id}
                          className="border border-zinc-200 dark:border-zinc-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{doc.tipo === 'PDF' ? '📄' : '📊'}</span>
                                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{doc.nome}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.tipo === 'PDF' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href={doc.url}
                                download
                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(doc);
                                }}
                                className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id);
                                }}
                                className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {supabaseDocumentos.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                          <div className="text-4xl mb-2">📁</div>
                          Nenhum documento encontrado
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {activeTab === 'acumuladores' ? '📋 Acumuladores' : activeTab === 'eventos' ? '🎪 Eventos' : '📁 Documentos'}
                        {selectedDate && ` - ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`}
                      </h3>
                      <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                      >
                        <span className="mr-2">✨</span>
                        Novo {activeTab === 'acumuladores' ? 'Acumulador' : activeTab === 'eventos' ? 'Evento' : 'Documento'}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredItems().map(item => (
                        <div
                          key={item.id}
                          className="border border-zinc-200 dark:border-zinc-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {activeTab === 'acumuladores' ? (
                                <div>
                                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {SUB_REGIOES[(item as Acumulador).sub]} - {(item as Acumulador).hora}
                                  </h4>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    {(item as Acumulador).endereco}
                                  </p>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    SEI: {(item as Acumulador).sei} | Placa: {(item as Acumulador).placaVeiculo}
                                  </p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor((item as Acumulador).status)}`}>
                                    {(item as Acumulador).status.replace('_', ' ')}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {(item as Evento).nome} - {(item as Evento).hora}
                                  </h4>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    {SUB_REGIOES[(item as Evento).sub]} - {(item as Evento).endereco}
                                  </p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getEventTypeColor((item as Evento).tipo)}`}>
                                    {(item as Evento).tipo}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredItems().length === 0 && selectedDate && (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                          <div className="text-4xl mb-2">📅</div>
                          Nenhum {activeTab === 'acumuladores' ? 'acumulador' : 'evento'} encontrado para esta data
                        </div>
                      )}
                      
                      {!selectedDate && (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                          <div className="text-4xl mb-2">👆</div>
                          Selecione uma data no calendário para ver os {activeTab === 'acumuladores' ? 'acumuladores' : 'eventos'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modais com tema escuro */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 ${
              'max-w-6xl'
            }`}>
              {activeTab === 'acumuladores' && (
                <AcumuladorForm
                  acumulador={editingItem as Acumulador}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
              {activeTab === 'eventos' && (
                <EventoForm
                  evento={editingItem as Evento}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
              {/* {false && activeTab === 'anotacoes' && (
                <AnotacaoForm
                  anotacao={editingItem as Anotacao}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )} */}
              {activeTab === 'documentos' && (
                <div className="space-y-6">
                  <DocumentoFormSupabase
                    documento={editingItem as Documento}
                    onSubmit={handleSave}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Upload Simples */}
        {showSimpleUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Upload Simples de Documento
                  </h2>
                  <button
                    onClick={() => setShowSimpleUpload(false)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <SimpleUpload onUploadComplete={handleSimpleUploadComplete} />
              </div>
            </div>
          </div>
        )}

        {/* Modal de visualização de anotação - REMOVIDO */}
        {/* 
        {showAnotacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{showAnotacao.titulo}</h2>
                  <button
                    onClick={() => setShowAnotacao(null)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {showAnotacao.tags && showAnotacao.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {showAnotacao.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {showAnotacao.conteudo && showAnotacao.conteudo.includes('<') ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: showAnotacao.conteudo }}
                    className="prose max-w-none prose-gray dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400"
                  />
                ) : (
                  <div className="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-blue-500">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, ...props }) => {
                          if (!src || src === '') {
                            return null;
                          }
                          return <img src={src} {...props} className="rounded-lg shadow-md" />;
                        }
                      }}
                    >
                      {showAnotacao.conteudo || '*Nenhum conteúdo*'}
                    </ReactMarkdown>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Atualizado em: {format(new Date(showAnotacao.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        */}
      </div>

    </div>
  );
}
