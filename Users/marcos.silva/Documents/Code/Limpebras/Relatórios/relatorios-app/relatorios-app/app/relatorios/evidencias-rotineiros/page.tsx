"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { listReports, getReport } from "@/lib/storage";
import type { ReportSummary, RotineirosRelatorio } from "@/lib/types";
import { SUB_REGIOES, TIPOS_SERVICO } from "@/lib/types";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { toast } from 'react-toastify';

export default function EvidenciasRotineirosPage() {
  const [items, setItems] = useState<ReportSummary[]>([]);
  const [tipoServico, setTipoServico] = useState<string>("ROTINEIROS");
  const [mesAno, setMesAno] = useState<string>("");
  const [dataFiltro, setDataFiltro] = useState<string>("");
  const [dataFiltroDate, setDataFiltroDate] = useState<Date | null>(null);
  const [subFiltro, setSubFiltro] = useState<string>(""); // Novo filtro por subprefeitura
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [rotineirosCompletos, setRotineirosCompletos] = useState<RotineirosRelatorio[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const reports = await listReports();
        setItems(reports);
        
        // Carregar dados completos dos serviços rotineiros
        const rotineirosIds = reports
          .filter(r => r.tipoServico === 'ROTINEIROS')
          .map(r => r.id);
        
        const rotineirosCompletos = [];
        for (const id of rotineirosIds) {
          try {
            const rotineiroCompleto = await getReport(id) as RotineirosRelatorio;
            if (rotineiroCompleto) {
              rotineirosCompletos.push(rotineiroCompleto);
            }
          } catch (error) {
            console.error(`Erro ao carregar serviço rotineiro ${id}:`, error);
          }
        }
        setRotineirosCompletos(rotineirosCompletos);
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
      // Também atualizar mesAno para compatibilidade
      setMesAno(`${year}-${month}`);
    } else {
      setDataFiltro("");
      setMesAno("");
    }
  }, [dataFiltroDate]);

  const filtered = items.filter((r) => {
    const matchesTipoServico = tipoServico ? r.tipoServico === tipoServico : true;
    const matchesMesAno = mesAno ? r.data.startsWith(mesAno) : true;
    return matchesTipoServico && matchesMesAno;
  });

  // Função para extrair mês/ano da data
  function getMesAnoFromDate(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${month} de ${year}`;
  }

  // Função para extrair ano-mês da data para filtro
  function getYearMonthFromDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

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

    if (!mesAno) {
      toast.info("📅 Por favor, selecione um mês/ano para gerar as evidências.", {
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

    // Filtrar serviços rotineiros completos pelo mês/ano e subprefeitura selecionados
    const rotineirosFiltrados = rotineirosCompletos
      .filter(rotineiro => {
        const matchesMesAno = rotineiro.data.startsWith(mesAno);
        const matchesSub = subFiltro ? rotineiro.sub === subFiltro : true;
        return matchesMesAno && matchesSub;
      })
      .sort((a, b) => {
        const subA = a.sub || 'SP';
        const subB = b.sub || 'SP';
        
        // Ordenação: CV, JT, MG, ST, SP
        const orderMap: { [key: string]: number } = {
          'CV': 1,
          'JT': 2,
          'MG': 3,
          'ST': 4,
          'SP': 5
        };
        
        const orderA = orderMap[subA] || 999;
        const orderB = orderMap[subB] || 999;
        
        return orderA - orderB;
      });

    if (rotineirosFiltrados.length === 0) {
      const filtroMsg = subFiltro ? ` para ${SUB_REGIOES[subFiltro as keyof typeof SUB_REGIOES]}` : "";
      toast.warning(`🔍 Nenhum serviço rotineiro encontrado para o mês/ano selecionado${filtroMsg}.`, {
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
    setExportProgress("Iniciando geração do PDF...");
    
    try {
      setExportProgress("Carregando dados e gerando HTML...");
      
      const response = await fetch('/api/export-evidencias-rotineiros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mesAno: getMesAnoFromDate(rotineirosFiltrados[0].data), 
          rotineiros: rotineirosFiltrados 
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar PDF: ${response.statusText}`);
      }

      setExportProgress("Processando PDF gerado...");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `evidencias-servicos-rotineiros-${mesAno}.pdf`; // fallback
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
      setExportProgress("Iniciando download...");
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
      setExportProgress("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold flex-1">Relatório Evidências - Serviços Rotineiros</h1>
        <Link href="/relatorios" className="text-zinc-600 dark:text-zinc-300 hover:underline">Voltar</Link>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Filtros para Evidências de Serviços Rotineiros</h2>
        
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Tipo de Serviço</label>
            <select 
              value={tipoServico} 
              onChange={(e) => setTipoServico(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            >
              <option value="ROTINEIROS">{TIPOS_SERVICO.ROTINEIROS}</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Subprefeitura</label>
            <select 
              value={subFiltro} 
              onChange={(e) => setSubFiltro(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            >
              <option value="">Todas as Subprefeituras</option>
              <option value="CV">{SUB_REGIOES.CV}</option>
              <option value="JT">{SUB_REGIOES.JT}</option>
              <option value="MG">{SUB_REGIOES.MG}</option>
              <option value="ST">{SUB_REGIOES.ST}</option>
              <option value="SP">{SUB_REGIOES.SP}</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Data Específica</label>
            <CustomDatePicker
              selectedDate={dataFiltroDate}
              onChange={setDataFiltroDate}
              placeholder="Selecione uma data específica"
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Mês/Ano</label>
            <input 
              type="month" 
              value={mesAno} 
              onChange={(e) => setMesAno(e.target.value)} 
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
            />
          </div>

          <button
            onClick={handleExportEvidencias}
            disabled={exporting || filtered.length === 0}
            className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
              exporting || filtered.length === 0
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {exporting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {exporting ? (exportProgress || 'Gerando PDF...') : 'Gerar PDF de Evidências'}
          </button>
        </div>

        {filtered.length > 0 && mesAno && (
          <div className="text-sm text-zinc-300">
            <strong>{filtered.length}</strong> relatório(s) encontrado(s) para <strong>{getMesAnoFromDate(filtered[0].data)}</strong>
            {subFiltro && (
              <span> em <strong>{SUB_REGIOES[subFiltro as keyof typeof SUB_REGIOES]}</strong></span>
            )}
            {rotineirosCompletos.filter(r => {
              const matchesMesAno = r.data.startsWith(mesAno);
              const matchesSub = subFiltro ? r.sub === subFiltro : true;
              return matchesMesAno && matchesSub;
            }).length > 0 && (
              <div className="mt-2 p-2 bg-zinc-800 rounded">
                <strong>Serviços Rotineiros para este mês{subFiltro ? ` em ${SUB_REGIOES[subFiltro as keyof typeof SUB_REGIOES]}` : ''}:</strong>
                <div className="mt-1 space-y-1">
                  {Object.entries(
                    rotineirosCompletos
                      .filter(r => {
                        const matchesMesAno = r.data.startsWith(mesAno);
                        const matchesSub = subFiltro ? r.sub === subFiltro : true;
                        return matchesMesAno && matchesSub;
                      })
                      .reduce((acc, rotineiro) => {
                        const subRegional = rotineiro.sub || 'SP';
                        if (!acc[subRegional]) acc[subRegional] = 0;
                        acc[subRegional]++;
                        return acc;
                      }, {} as Record<string, number>)
                  ).map(([sub, count]) => (
                    <div key={sub} className="text-xs">
                      • {SUB_REGIOES[sub as keyof typeof SUB_REGIOES]}: {count} serviço(s) rotineiro(s)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Serviços Rotineiros Encontrados</h2>
        
        {filtered.length === 0 ? (
          <p className="text-zinc-400">Nenhum serviço rotineiro encontrado com os filtros aplicados.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded border
                  bg-stone-100 shadow-md border-zinc-200
                  dark:bg-zinc-800 dark:border-zinc-700
                  transition-colors"
              >
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-300">{item.title}</div>
                  <div className="text-sm text-zinc-900 dark:text-zinc-400">
                    {item.sub ? SUB_REGIOES[item.sub as keyof typeof SUB_REGIOES] : "-"} • {item.data}
                  </div>
                </div>
                <Link 
                  href={`/relatorios/${item.id}`}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
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
