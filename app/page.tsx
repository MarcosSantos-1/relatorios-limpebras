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
  const [activeTab, setActiveTab] = useState<'acumuladores' | 'eventos' | 'documentos' | 'anotacoes'>('acumuladores');
  const [showForm, setShowForm] = useState(false);
  const [showSimpleUpload, setShowSimpleUpload] = useState(false);
  const [editingItem, setEditingItem] = useState<Acumulador | Evento | Documento | null>(null);
  const [anotacoes, setAnotacoes] = useState<Array<{id: string, titulo: string, conteudo: string, concluida: boolean, createdAt: number}>>([]);
  const [novaAnotacao, setNovaAnotacao] = useState({titulo: '', conteudo: ''});
  const [checklistItems, setChecklistItems] = useState<Array<{id: string, texto: string, concluida: boolean, createdAt: number}>>([]);
  const [novoChecklistItem, setNovoChecklistItem] = useState('');

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
    } else if (activeTab === 'anotacoes') {
      // Adicionar nova anotação
      if (novaAnotacao.titulo.trim()) {
        const novaAnot = {
          id: Date.now().toString(),
          titulo: novaAnotacao.titulo,
          conteudo: novaAnotacao.conteudo,
          concluida: false,
          createdAt: Date.now()
        };
        setAnotacoes(prev => [novaAnot, ...prev]);
        setNovaAnotacao({titulo: '', conteudo: ''});
      }
    } else {
      setEditingItem(null);
      setShowForm(true);
    }
  };

  const toggleAnotacao = (id: string) => {
    setAnotacoes(prev => prev.map(anot => 
      anot.id === id ? {...anot, concluida: !anot.concluida} : anot
    ));
  };

  const deleteAnotacao = (id: string) => {
    setAnotacoes(prev => prev.filter(anot => anot.id !== id));
  };

  const addChecklistItem = () => {
    if (novoChecklistItem.trim()) {
      const novoItem = {
        id: Date.now().toString(),
        texto: novoChecklistItem.trim(),
        concluida: false,
        createdAt: Date.now()
      };
      setChecklistItems(prev => [...prev, novoItem]);
      setNovoChecklistItem('');
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? {...item, concluida: !item.concluida} : item
    ));
  };

  const deleteChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const getCompletedItems = () => {
    const completedAnotacoes = anotacoes.filter(anot => anot.concluida);
    const completedChecklist = checklistItems.filter(item => item.concluida);
    return { anotacoes: completedAnotacoes, checklist: completedChecklist };
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

  // Função para organizar dados por dias (do mais próximo para o mais antigo)
  const getItemsByDays = () => {
    if (activeTab === 'documentos') {
      return { documentos: supabaseDocumentos };
    }
    
    const items = activeTab === 'acumuladores' ? acumuladores : eventos;
    const groupedByDay: { [key: string]: any[] } = {};
    
    items.forEach(item => {
      const dayKey = format(parseDate(item.dia), 'yyyy-MM-dd');
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = [];
      }
      groupedByDay[dayKey].push(item);
    });
    
    // Ordenar dias do mais próximo para o mais antigo
    const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });
    
    return { groupedByDay, sortedDays };
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

          {/* Checklist Dinâmico */}
          {checklistItems.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      Checklist Dinâmico
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {checklistItems.filter(item => !item.concluida).length} pendente{checklistItems.filter(item => !item.concluida).length !== 1 ? 's' : ''} • {checklistItems.filter(item => item.concluida).length} concluída{checklistItems.filter(item => item.concluida).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {checklistItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        item.concluida 
                          ? 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20' 
                          : 'border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        item.concluida 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}>
                        {item.concluida && <span className="text-xs">✓</span>}
                      </div>
                      
                      <span className={`flex-1 text-sm ${
                        item.concluida 
                          ? 'text-green-800 dark:text-green-200 line-through' 
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {item.texto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seção de Itens Finalizados */}
          {(() => {
            const { anotacoes: completedAnotacoes, checklist: completedChecklist } = getCompletedItems();
            const totalCompleted = completedAnotacoes.length + completedChecklist.length;
            
            if (totalCompleted === 0) return null;
            
            return (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🎉</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                        Tarefas Concluídas Hoje
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        {totalCompleted} item{totalCompleted !== 1 ? 's' : ''} finalizado{totalCompleted !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Anotações Concluídas */}
                    {completedAnotacoes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                          <span>📝</span>
                          Anotações ({completedAnotacoes.length})
                        </h4>
                        <div className="space-y-2">
                          {completedAnotacoes.slice(0, 3).map(anotacao => (
                            <div key={anotacao.id} className="flex items-center gap-2 p-2 bg-green-100/50 dark:bg-green-800/30 rounded-lg">
                              <span className="text-green-600 dark:text-green-400">✅</span>
                              <span className="text-sm text-green-800 dark:text-green-200 line-through">
                                {anotacao.titulo}
                              </span>
                            </div>
                          ))}
                          {completedAnotacoes.length > 3 && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              +{completedAnotacoes.length - 3} mais...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Checklist Concluído */}
                    {completedChecklist.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                          <span>✅</span>
                          Checklist ({completedChecklist.length})
                        </h4>
                        <div className="space-y-2">
                          {completedChecklist.slice(0, 3).map(item => (
                            <div key={item.id} className="flex items-center gap-2 p-2 bg-green-100/50 dark:bg-green-800/30 rounded-lg">
                              <span className="text-green-600 dark:text-green-400">✅</span>
                              <span className="text-sm text-green-800 dark:text-green-200 line-through">
                                {item.texto}
                              </span>
                            </div>
                          ))}
                          {completedChecklist.length > 3 && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              +{completedChecklist.length - 3} mais...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

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
                      { key: 'documentos', label: 'Documentos', icon: '📁' },
                      { key: 'anotacoes', label: 'Anotações', icon: '📝' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as 'acumuladores' | 'eventos' | 'documentos' | 'anotacoes')}
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
                {activeTab === 'anotacoes' ? (
                  <div className="space-y-6">
                    {/* Formulário de nova anotação */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Nova Anotação
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <input
                            type="text"
                            placeholder="📝 Título da anotação..."
                            value={novaAnotacao.titulo}
                            onChange={(e) => setNovaAnotacao(prev => ({...prev, titulo: e.target.value}))}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                          />
                        </div>
                        <div>
                          <textarea
                            placeholder="📄 Conteúdo da anotação..."
                            value={novaAnotacao.conteudo}
                            onChange={(e) => setNovaAnotacao(prev => ({...prev, conteudo: e.target.value}))}
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                          />
                        </div>
                        <button
                          onClick={handleAddNew}
                          disabled={!novaAnotacao.titulo.trim()}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center gap-2"
                        >
                          <span>💾</span>
                          Salvar Anotação
                        </button>
                      </div>
                    </div>

                    {/* Gerenciamento do Checklist */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✅</span>
                        Gerenciar Checklist
                      </h3>
                      
                      {/* Adicionar novo item */}
                      <div className="space-y-3 mb-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="➕ Nova tarefa..."
                            value={novoChecklistItem}
                            onChange={(e) => setNovoChecklistItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                            className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                          />
                          <button
                            onClick={addChecklistItem}
                            disabled={!novoChecklistItem.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            <span>➕</span>
                          </button>
                        </div>
                      </div>

                      {/* Lista de itens do checklist para gerenciamento */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                          <span>📝</span>
                          Tarefas ({checklistItems.length})
                        </h4>
                        
                        {checklistItems.length === 0 ? (
                          <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="text-sm">Nenhuma tarefa ainda</p>
                            <p className="text-xs">Adicione sua primeira tarefa acima</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {checklistItems.map(item => (
                              <div
                                key={item.id}
                                className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                  item.concluida 
                                    ? 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20' 
                                    : 'border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                }`}
                              >
                                <button
                                  onClick={() => toggleChecklistItem(item.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    item.concluida 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-500'
                                  }`}
                                >
                                  {item.concluida && <span className="text-xs">✓</span>}
                                </button>
                                
                                <span className={`flex-1 text-sm ${
                                  item.concluida 
                                    ? 'text-green-800 dark:text-green-200 line-through' 
                                    : 'text-zinc-900 dark:text-zinc-100'
                                }`}>
                                  {item.texto}
                                </span>
                                
                                <button
                                  onClick={() => deleteChecklistItem(item.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                  title="Excluir tarefa"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lista de anotações */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Minhas Anotações ({anotacoes.length})
                      </h3>
                      
                      {anotacoes.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                          <div className="text-4xl mb-2">📝</div>
                          <h4 className="text-sm font-medium mb-1">Nenhuma anotação ainda</h4>
                          <p className="text-xs">Crie sua primeira anotação acima</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {anotacoes.map(anotacao => (
                            <div
                              key={anotacao.id}
                              className={`group border rounded-xl p-4 hover:shadow-lg transition-all duration-200 ${
                                anotacao.concluida 
                                  ? 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20' 
                                  : 'border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleAnotacao(anotacao.id)}
                                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    anotacao.concluida 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-zinc-300 dark:border-zinc-600 hover:border-purple-500'
                                  }`}
                                >
                                  {anotacao.concluida && <span className="text-xs">✓</span>}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-semibold mb-1 text-sm ${
                                    anotacao.concluida 
                                      ? 'text-green-800 dark:text-green-200 line-through' 
                                      : 'text-zinc-900 dark:text-zinc-100'
                                  }`}>
                                    {anotacao.titulo}
                                  </h4>
                                  
                                  {anotacao.conteudo && (
                                    <p className={`text-xs mb-2 ${
                                      anotacao.concluida 
                                        ? 'text-green-600 dark:text-green-300' 
                                        : 'text-zinc-600 dark:text-zinc-400'
                                    }`}>
                                      {anotacao.conteudo}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1">
                                      <span>📅</span>
                                      {format(new Date(anotacao.createdAt), 'dd/MM HH:mm', { locale: ptBR })}
                                    </span>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => deleteAnotacao(anotacao.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                  title="Excluir anotação"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'documentos' ? (
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
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {activeTab === 'acumuladores' ? '📋 Acumuladores' : '🎪 Eventos'}
                        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-2">
                          - Todos os dias do mês
                        </span>
                      </h3>
                      <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg flex items-center gap-2"
                      >
                        <span>✨</span>
                        Novo {activeTab === 'acumuladores' ? 'Acumulador' : 'Evento'}
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {(() => {
                        const { groupedByDay, sortedDays } = getItemsByDays();
                        
                        if (sortedDays?.length === 0) {
                          return (
                            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                              <div className="text-6xl mb-4">📅</div>
                              <h4 className="text-lg font-medium mb-2">Nenhum {activeTab === 'acumuladores' ? 'acumulador' : 'evento'} agendado</h4>
                              <p className="text-sm">Adicione novos {activeTab === 'acumuladores' ? 'acumuladores' : 'eventos'} para começar</p>
                            </div>
                          );
                        }
                        
                        return sortedDays?.map(dayKey => {
                          const dayItems = groupedByDay[dayKey];
                          const dayDate = new Date(dayKey);
                          const isToday = isSameDay(dayDate, new Date());
                          const isPast = dayDate < new Date();
                          
                          return (
                            <div key={dayKey} className="space-y-3">
                              {/* Cabeçalho do dia */}
                              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                                isToday 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                                  : isPast 
                                    ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                                    : 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                              }`}>
                                <div className={`w-3 h-3 rounded-full ${
                                  isToday 
                                    ? 'bg-blue-500' 
                                    : isPast 
                                      ? 'bg-zinc-400' 
                                      : 'bg-green-500'
                                }`}></div>
                                <div className="flex-1">
                                  <h4 className={`font-semibold ${
                                    isToday 
                                      ? 'text-blue-900 dark:text-blue-100' 
                                      : isPast 
                                        ? 'text-zinc-700 dark:text-zinc-300' 
                                        : 'text-green-900 dark:text-green-100'
                                  }`}>
                                    {format(dayDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                                  </h4>
                                  <p className={`text-sm ${
                                    isToday 
                                      ? 'text-blue-700 dark:text-blue-300' 
                                      : isPast 
                                        ? 'text-zinc-500 dark:text-zinc-400' 
                                        : 'text-green-700 dark:text-green-300'
                                  }`}>
                                    {dayItems.length} {activeTab === 'acumuladores' ? 'acumulador(es)' : 'evento(s)'}
                                    {isToday && ' • Hoje'}
                                    {isPast && ' • Passado'}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isToday 
                                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' 
                                    : isPast 
                                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300' 
                                      : 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                                }`}>
                                  {isToday ? '📅 Hoje' : isPast ? '⏰ Passado' : '🔮 Futuro'}
                                </div>
                              </div>
                              
                              {/* Itens do dia */}
                              <div className="space-y-2 ml-6">
                                {dayItems.map(item => (
                        <div
                          key={item.id}
                                    className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                                      isToday 
                                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30' 
                                        : isPast 
                                          ? 'border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                          : 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20 hover:bg-green-50 dark:hover:bg-green-900/30'
                                    }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {activeTab === 'acumuladores' ? (
                                <div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-lg">🚛</span>
                                              <h5 className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {SUB_REGIOES[(item as Acumulador).sub]} - {(item as Acumulador).hora}
                                              </h5>
                                            </div>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                                              📍 {(item as Acumulador).endereco}
                                            </p>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                                              🆔 SEI: {(item as Acumulador).sei} | 🚗 Placa: {(item as Acumulador).placaVeiculo}
                                            </p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor((item as Acumulador).status)}`}>
                                              {(() => {
                                                const status = (item as Acumulador).status;
                                                const icons = {
                                                  'finalizado': '✅',
                                                  'aguardando_descarga': '⏳',
                                                  'cancelado': '❌',
                                                  'nao_comecou': '⏸️'
                                                };
                                                return `${icons[status as keyof typeof icons] || '📋'} ${status.replace('_', ' ')}`;
                                              })()}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-lg">🎪</span>
                                              <h5 className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {(item as Evento).nome} - {(item as Evento).hora}
                                              </h5>
                                            </div>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                                              📍 {SUB_REGIOES[(item as Evento).sub]} - {(item as Evento).endereco}
                                            </p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor((item as Evento).tipo)}`}>
                                              {(() => {
                                                const tipo = (item as Evento).tipo;
                                                const icons = {
                                                  'evento': '🎉',
                                                  'reuniao': '🤝',
                                                  'outros': '📝'
                                                };
                                                return `${icons[tipo as keyof typeof icons] || '📋'} ${tipo}`;
                                              })()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                          className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                          title="Editar"
                              >
                                          ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                          title="Excluir"
                              >
                                          🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                        </div>
                        </div>
                          );
                        });
                      })()}
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
