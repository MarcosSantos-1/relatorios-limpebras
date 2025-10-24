"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listReports, deleteReport } from "@/lib/storage";
import { getStorageInfo } from "@/lib/storage";
import type { ReportSummary } from "@/lib/types";
import { SUB_REGIOES, TIPOS_SERVICO } from "@/lib/types";
import { formatDateBR, formatDateWithWeekday } from "@/lib/utils";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { toast } from 'react-toastify';

export default function RelatoriosPage() {
  const [items, setItems] = useState<ReportSummary[]>([]);
  const [tipoServico, setTipoServico] = useState<string>("");
  const [sub, setSub] = useState<string>("");
  const [dataFiltro, setDataFiltro] = useState<string>("");
  const [dataFiltroDate, setDataFiltroDate] = useState<Date | null>(null);
  const [enderecoFiltro, setEnderecoFiltro] = useState<string>("");
  const [storageInfo, setStorageInfo] = useState({ 
    documentCount: 0, 
    maxCapacity: 2 * 1024 * 1024 * 1024, // 2GB
    availableCapacity: 0,
    usedCapacity: 0, 
    percentage: 0 
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    reportId: string | null;
    reportTitle: string;
  }>({
    isOpen: false,
    reportId: null,
    reportTitle: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const reports = await listReports();
        setItems(reports);
        const storage = await getStorageInfo() as any;
        setStorageInfo(storage);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const filteredItems = items.filter((r) => {
      const matchesTipoServico = tipoServico ? r.tipoServico === tipoServico : true;
      const matchesSub = sub ? r.sub === sub : true;
      const matchesData = dataFiltro ? r.data === dataFiltro : true;
      const matchesEndereco = enderecoFiltro 
        ? (r.endereco || "").toLowerCase().includes(enderecoFiltro.toLowerCase())
        : true;
      return matchesTipoServico && matchesSub && matchesData && matchesEndereco;
    });

    // Ordenar por data (mais recente primeiro) - ex: Mutirão 28/09 > Revitalização 25/09 > Acumulador 19/09
    return filteredItems.sort((a, b) => {
      // Primeiro por data (mais recente primeiro) - independente do dia da semana
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Se a data for igual, ordenar por sub-região (CV > JT > MG > ST > SP)
      const subOrder = { 'CV': 1, 'JT': 2, 'MG': 3, 'ST': 4, 'SP': 5 };
      const orderA = subOrder[a.sub as keyof typeof subOrder] || 999;
      const orderB = subOrder[b.sub as keyof typeof subOrder] || 999;
      
      return orderA - orderB;
    });
  }, [items, tipoServico, sub, dataFiltro, enderecoFiltro]);

  // Paginação
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoServico, sub, dataFiltro, enderecoFiltro]);

  // Sincronizar dataFiltroDate com dataFiltro
  useEffect(() => {
    if (dataFiltroDate) {
      const year = dataFiltroDate.getFullYear();
      const month = String(dataFiltroDate.getMonth() + 1).padStart(2, '0');
      const day = String(dataFiltroDate.getDate()).padStart(2, '0');
      setDataFiltro(`${year}-${month}-${day}`);
    } else {
      setDataFiltro("");
    }
  }, [dataFiltroDate]);

  const onDelete = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      reportId: id,
      reportTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.reportId) return;
    
    try {
      console.log('🗑️ Confirmado, deletando relatório...');
      await deleteReport(confirmDialog.reportId);
      console.log('🗑️ Relatório deletado, recarregando lista...');
      const reports = await listReports();
      setItems(reports);
      const storage = await getStorageInfo() as any;
      setStorageInfo(storage);
      console.log('✅ Lista recarregada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao deletar relatório:', error);
      toast.error(`❌ Erro ao deletar relatório: ${error}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: {
          background: "#dc2626",
          border: "1px solid #ef4444",
          color: "#f9fafb"
        }
      });
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      reportId: null,
      reportTitle: ""
    });
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">📊 Relatórios</h1>
            <p className="text-indigo-100"></p>
          </div>
          <div className="text-right">

          </div>
        </div>
        
        {/* Indicador de uso do storage */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              💾 Armazenamento IndexedDB: {Math.round(storageInfo.usedCapacity / 1024 / 1024)}MB / {Math.round(storageInfo.maxCapacity / 1024 / 1024)}MB
            </div>
            <div className="text-sm font-bold">{storageInfo.percentage}%</div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                storageInfo.percentage > 90 ? 'bg-red-400' : 
                storageInfo.percentage > 70 ? 'bg-orange-400' : 'bg-green-400'
            }`}
            style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
          ></div>
        </div>
          <div className="text-xs text-indigo-100 mt-2">
            Limite: 2GB | Documentos: {storageInfo.documentCount} | Capacidade: {Math.round(storageInfo.availableCapacity / 1024 / 1024 / 1024)}GB disponível
          </div>
        </div>
      </div>


      {/* Filtros modernos */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold mb-1">Tipo de Serviço</label>
            <select 
              value={tipoServico} 
              onChange={(e) => setTipoServico(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 focus:shadow-md"
            >
            <option value="">Todos</option>
            <option value="ALAGAMENTOS">{TIPOS_SERVICO.ALAGAMENTOS}</option>
            <option value="MUTIRAO">{TIPOS_SERVICO.MUTIRAO}</option>
            <option value="REVITALIZACAO">{TIPOS_SERVICO.REVITALIZACAO}</option>
            <option value="ACUMULADOR">{TIPOS_SERVICO.ACUMULADOR}</option>
            <option value="ZELADORIA">{TIPOS_SERVICO.ZELADORIA}</option>
            <option value="DDS">{TIPOS_SERVICO.DDS}</option>
            <option value="EVENTOS">{TIPOS_SERVICO.EVENTOS}</option>
            <option value="ROTINEIROS">{TIPOS_SERVICO.ROTINEIROS}</option>
          </select>
        </div>
          
        <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold mb-1">Sub-região</label>
            <select 
              value={sub} 
              onChange={(e) => setSub(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 focus:shadow-md"
            >
            <option value="">Todas</option>
            <option value="SP">{SUB_REGIOES.SP}</option>
            <option value="CV">{SUB_REGIOES.CV}</option>
            <option value="JT">{SUB_REGIOES.JT}</option>
            <option value="MG">{SUB_REGIOES.MG}</option>
            <option value="ST">{SUB_REGIOES.ST}</option>
          </select>
        </div>
          
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold mb-1">Data</label>
            <CustomDatePicker
              selectedDate={dataFiltroDate}
              onChange={setDataFiltroDate}
              placeholder="Selecione uma data"
            />
          </div>
          
        <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold mb-1">Endereço / Local</label>
          <input 
            value={enderecoFiltro} 
            onChange={(e) => setEnderecoFiltro(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 focus:shadow-md" 
            placeholder="Digite o endereço..."
          />
          </div>
          
          <div className="flex flex-col gap-2">
            <Link 
              href="/relatorios/novo-registro" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Evidência
            </Link>
            <Link 
              href="/relatorios/novo-rotineiros-lote" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Registro em Lote - Rotineiros
            </Link>
            <Link 
              href="/relatorios/novo-ecopontos-lote" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Registro em Lote - Ecopontos
            </Link>
          </div>
        </div>
      </div>

      {/* Cards modernos */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-zinc-600 dark:text-zinc-400">Carregando relatórios...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
            <svg className="w-16 h-16 text-zinc-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Ajuste os filtros ou adicione um novo relatório</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((r) => (
              <div 
                key={r.id} 
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-700 overflow-hidden group hover:scale-[1.02]"
              >
                {/* Header do card */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-zinc-700 dark:to-zinc-700 p-4 border-b border-zinc-200 dark:border-zinc-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
                        {r.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                  {r.sub ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            r.sub === 'CV' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                            r.sub === 'JT' ? 'bg-gradient-to-r from-indigo-400 to-indigo-500 text-white' :
                            r.sub === 'MG' ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white' :
                            r.sub === 'ST' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                            r.sub === 'SP' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                            'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            📍 {SUB_REGIOES[r.sub as keyof typeof SUB_REGIOES]}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">Sem sub-região</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                      {r.endereco || "Endereço não informado"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m-6 4h6" />
                    </svg>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatDateWithWeekday(r.data)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                      {r.fotoCount || 0} foto{(r.fotoCount || 0) !== 1 ? 's' : ''}
                  </span>
                  </div>
                </div>

                {/* Footer com ações */}
                <div className="bg-zinc-50 dark:bg-zinc-700/50 px-4 py-3 border-t border-zinc-200 dark:border-zinc-600">
                  <div className="flex gap-2 justify-end">
                    <Link 
                      href={`/relatorios/${r.id}`} 
                      className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm hover:shadow-md"
                      title="Ver relatório"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                    <Link 
                      href={`/relatorios/${r.id}/editar`} 
                      className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm hover:shadow-md"
                      title="Editar relatório"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                    <button 
                      onClick={() => onDelete(r.id, r.title)} 
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm hover:shadow-md"
                      title="Excluir relatório"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                currentPage === page
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm hover:shadow-md'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Relatório"
        message={`Tem certeza que deseja excluir o relatório "${confirmDialog.reportTitle}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
      </div>
    </ProtectedRoute>
  );
}