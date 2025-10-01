"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { listReports, getReport } from "@/lib/storage";
import type { ReportSummary, MutiraoRelatorio } from "@/lib/types";
import { SUB_REGIOES, TIPOS_SERVICO } from "@/lib/types";
import { CustomDatePicker } from "@/components/CustomDatePicker";
// Função para exportar PDF via API unificada
import { toast } from 'react-toastify';

export default function EvidenciasPage() {
  const [items, setItems] = useState<ReportSummary[]>([]);
  const [tipoServico, setTipoServico] = useState<string>("MUTIRAO");
  const [dataFiltro, setDataFiltro] = useState<string>("");
  const [dataFiltroDate, setDataFiltroDate] = useState<Date | null>(null);
  const [exporting, setExporting] = useState(false);
  const [mutiroesCompletos, setMutiroesCompletos] = useState<MutiraoRelatorio[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const reports = await listReports();
        setItems(reports);
        
        // Carregar dados completos dos mutirões
        const mutiroesIds = reports
          .filter(r => r.tipoServico === 'MUTIRAO')
          .map(r => r.id);
        
        const mutiroesCompletos = [];
        for (const id of mutiroesIds) {
          try {
            const mutiraoCompleto = await getReport(id) as MutiraoRelatorio;
            if (mutiraoCompleto) {
              mutiroesCompletos.push(mutiraoCompleto);
            }
          } catch (error) {
            console.error(`Erro ao carregar mutirão ${id}:`, error);
          }
        }
        setMutiroesCompletos(mutiroesCompletos);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        setItems([]);
      }
    };
    loadReports();
  }, []);

  // Sincronizar DatePicker com filtro de data
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

  const filtered = items.filter((r) => {
    const matchesTipoServico = tipoServico ? r.tipoServico === tipoServico : true;
    const matchesData = dataFiltro ? r.data === dataFiltro : true;
    return matchesTipoServico && matchesData;
  });

  async function handleExportEvidencias() {
    if (filtered.length === 0) {
      toast.warning("Nenhum relatório encontrado para gerar evidências.", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: {
          background: "#1f2937",
          border: "1px solid #374151",
          color: "#f9fafb"
        }
      });
      return;
    }

    if (!dataFiltro) {
      toast.info("📅 Por favor, selecione uma data para gerar as evidências.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: {
          background: "#1e40af",
          border: "1px solid #3b82f6",
          color: "#f9fafb"
        }
      });
      return;
    }

    // Filtrar mutirões completos pela data selecionada e ordenar alfabeticamente por sub-região
    const mutiroesFiltrados = mutiroesCompletos
      .filter(mutirao => mutirao.data === dataFiltro)
      .sort((a, b) => {
        const subA = a.secoes[0]?.sub || 'SP';
        const subB = b.secoes[0]?.sub || 'SP';
        
        // Ordenação alfabética: CV, JT, MG, ST
        const orderMap: { [key: string]: number } = {
          'CV': 1,
          'JT': 2,
          'MG': 3,
          'ST': 4,
          'SP': 5 // fallback para outras sub-regiões
        };
        
        const orderA = orderMap[subA] || 999;
        const orderB = orderMap[subB] || 999;
        
        return orderA - orderB;
      });

    if (mutiroesFiltrados.length === 0) {
      toast.warning("🔍 Nenhum mutirão encontrado para a data selecionada.", {
        position: "top-center",
        autoClose: 4000,
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
      return;
    }

    setExporting(true);
    try {
      const response = await fetch('/api/export-evidencias-mutiroes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: dataFiltro, 
          mutiroes: mutiroesFiltrados 
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // O nome do arquivo já é definido pelo servidor no header Content-Disposition
      // Vamos extrair o nome do header se disponível, senão usar um padrão
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `evidencias-mutiroes-${dataFiltro}.pdf`;
      if (contentDisposition) {
        // Tenta primeiro o formato UTF-8 codificado
        let fileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1]);
        } else {
          // Fallback para o formato tradicional
          fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }
        }
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("PDF de evidências gerado com sucesso!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: {
          background: "#059669",
          border: "1px solid #10b981",
          color: "#f9fafb"
        }
      });
    } catch (error) {
      console.error("Erro ao exportar evidências:", error);
      toast.error("Erro ao gerar PDF de evidências. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold flex-1">Relatórios de Evidências</h1>
        <Link href="/relatorios" className="text-zinc-300 hover:underline">Voltar</Link>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Filtros para Evidências</h2>
        
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Tipo de Serviço</label>
            <select 
              value={tipoServico} 
              onChange={(e) => setTipoServico(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            >
              <option value="MUTIRAO">{TIPOS_SERVICO.MUTIRAO}</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Data</label>
            <CustomDatePicker
              selectedDate={dataFiltroDate}
              onChange={setDataFiltroDate}
              placeholder="Selecione uma data"
              className="w-full"
            />
          </div>

          <button
            onClick={handleExportEvidencias}
            disabled={exporting || filtered.length === 0}
            className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
              exporting || filtered.length === 0
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {exporting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {exporting ? 'Gerando PDF...' : 'Gerar PDF de Evidências'}
          </button>
        </div>

        {filtered.length > 0 && dataFiltro && (
          <div className="text-sm text-zinc-300">
            <strong>{filtered.length}</strong> relatório(s) encontrado(s) para a data <strong>
              {(() => {
                // Converte "2025-09-23" para "23 de Setembro de 2025"
                const meses = [
                  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ];
                if (dataFiltro && dataFiltro.includes('-')) {
                  const [ano, mes, dia] = dataFiltro.split('-');
                  const mesNome = meses[parseInt(mes, 10) - 1];
                  return `${parseInt(dia, 10)} de ${mesNome} de ${ano}`;
                }
                return dataFiltro;
              })()}
            </strong>
            {mutiroesCompletos.filter(m => m.data === dataFiltro).length > 0 && (
              <div className="mt-2 p-2 rounded bg-zinc-200 dark:bg-zinc-800">
                <strong className="text-zinc-900 dark:text-zinc-100">Mutirões para esta data:</strong>
                <div className="mt-1 space-y-1">
                  {Object.entries(
                    mutiroesCompletos
                      .filter(m => m.data === dataFiltro)
                      .reduce((acc, mutirao) => {
                        const subRegional = mutirao.secoes[0]?.sub || 'SP';
                        if (!acc[subRegional]) acc[subRegional] = 0;
                        acc[subRegional]++;
                        return acc;
                      }, {} as Record<string, number>)
                  ).map(([sub, count]) => (
                    <div key={sub} className="text-xs text-zinc-100 dark:text-zinc-100">
                      • {SUB_REGIOES[sub as keyof typeof SUB_REGIOES]}: {count} mutirão(ões)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Relatórios Encontrados</h2>
        
        {filtered.length === 0 ? (
          <p className="text-zinc-400">Nenhum relatório encontrado com os filtros aplicados.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-200 dark:bg-zinc-800 rounded border border-zinc-400/15 shadow-md dark:border-zinc-700
            ">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-zinc-900 dark:text-zinc-400">
                    {item.sub ? SUB_REGIOES[item.sub as keyof typeof SUB_REGIOES] : "-"} • {(() => {
                      const parts = item.data?.split('-');
                      return parts && parts.length === 3
                        ? `${parts[2]}/${parts[1]}/${parts[0]}`
                        : item.data;
                    })()}
                  </div>
                </div>
                <Link 
                  href={`/relatorios/${item.id}`}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}