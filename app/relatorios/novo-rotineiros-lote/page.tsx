"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RotineirosRelatorio, SubRegiao, SERVICOS_MUTIRAO, SUB_REGIOES } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

interface DiaServico {
  data: string;
  servicos: string[];
  fotos: Record<string, string[]>;
}

export default function NovoRotineirosLotePage() {
  const [assunto, setAssunto] = useState("Serviços Rotineiros");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [tipoPeriodo, setTipoPeriodo] = useState<"semana" | "mes">("semana");
  const [diasServicos, setDiasServicos] = useState<DiaServico[]>([]);
  const [saving, setSaving] = useState(false);

  // Gerar lista de dias baseado no período selecionado
  const gerarDiasPeriodo = () => {
    if (!dataInicio || !dataFim) return [];
    
    const dias: DiaServico[] = [];
    // Corrigir problema de fuso horário - usar apenas a parte da data
    const dataAtual = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
    const dataFinal = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate());
    
    while (dataAtual <= dataFinal) {
      // Formatar data no formato YYYY-MM-DD sem problemas de fuso
      const ano = dataAtual.getFullYear();
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const dataISO = `${ano}-${mes}-${dia}`;
      
      dias.push({
        data: dataISO,
        servicos: [],
        fotos: {}
      });
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return dias;
  };

  // Atualizar lista de dias quando período muda
  const handlePeriodoChange = () => {
    if (dataInicio && dataFim) {
      const novosDias = gerarDiasPeriodo();
      setDiasServicos(novosDias);
    }
  };

  // Selecionar/deselecionar serviço para um dia específico
  const toggleServicoDia = (diaIndex: number, servico: string) => {
    setDiasServicos(prev => {
      const novosDias = [...prev];
      const diaAtual = novosDias[diaIndex];
      
      // Criar uma cópia do dia atual para evitar mutação
      const novoDia = {
        ...diaAtual,
        servicos: [...diaAtual.servicos]
      };
      
      if (novoDia.servicos.includes(servico)) {
        // Remover serviço e suas fotos
        const { [servico]: fotosRemovidas, ...outrasFotos } = novoDia.fotos;
        novoDia.servicos = novoDia.servicos.filter(s => s !== servico);
        novoDia.fotos = outrasFotos;
      } else {
        // Adicionar serviço
        novoDia.servicos.push(servico);
      }
      
      novosDias[diaIndex] = novoDia;
      return novosDias;
    });
  };

  function compressImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFileUpload(file: File, callback: (url: string) => void) {
    compressImage(file, 800, 0.8).then(callback);
  }

  // Adicionar fotos para um serviço específico de um dia
  const addFotoServicoDia = (diaIndex: number, servico: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const dia = diasServicos[diaIndex];
        const currentFotos = dia.fotos[servico] || [];
        
        // Verificar limite de fotos (máximo 10 por serviço)
        if (currentFotos.length + fileArray.length > 10) {
          toast.error(`Máximo de 10 fotos por serviço. Você já tem ${currentFotos.length} foto(s) para este serviço.`);
          return;
        }

        fileArray.forEach((file, index) => {
          handleFileUpload(file, (url) => {
            setDiasServicos(prev => {
              const novosDias = [...prev];
              const novoDia = { ...novosDias[diaIndex] };
              novoDia.fotos = {
                ...novoDia.fotos,
                [servico]: [...(novoDia.fotos[servico] || []), url]
              };
              novosDias[diaIndex] = novoDia;
              return novosDias;
            });
          });
        });
      }
    };
    input.click();
  };

  // Remover foto de um serviço específico de um dia
  const removeFotoServicoDia = (diaIndex: number, servico: string, fotoIndex: number) => {
    setDiasServicos(prev => {
      const novosDias = [...prev];
      const novoDia = { ...novosDias[diaIndex] };
      novoDia.fotos = {
        ...novoDia.fotos,
        [servico]: novoDia.fotos[servico]?.filter((_, i) => i !== fotoIndex) || []
      };
      novosDias[diaIndex] = novoDia;
      return novosDias;
    });
  };

  // Formatar data para exibição
  const formatarData = (dataISO: string) => {
    // Criar data sem problemas de fuso horário
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Salvar todos os registros
  const salvarTodos = async () => {
    // Validações
    if (!dataInicio || !dataFim) {
      toast.error("Por favor, selecione o período (data início e fim).");
      return;
    }

    if (diasServicos.length === 0) {
      toast.error("Nenhum dia foi gerado para o período selecionado.");
      return;
    }

    // Verificar se pelo menos um dia tem serviços
    const diasComServicos = diasServicos.filter(dia => dia.servicos.length > 0);
    if (diasComServicos.length === 0) {
      toast.error("Por favor, selecione pelo menos um serviço para pelo menos um dia.");
      return;
    }

    setSaving(true);
    let sucessos = 0;
    let erros = 0;

    try {
      // Processar cada dia que tem serviços
      for (const dia of diasComServicos) {
        const now = Date.now();
        const id = uuidv4();
        
        // Criar serviços com fotos para este dia
        const servicos = dia.servicos.map(servico => ({
          assunto: servico,
          fotos: (dia.fotos[servico] || []).map(url => ({ url, descricao: "" })),
          observacao: ""
        }));
        
        const rel: RotineirosRelatorio = {
          id,
          tipoServico: "ROTINEIROS",
          assunto,
          data: dia.data,
          sub,
          servicos,
          createdAt: now,
          updatedAt: now,
        };
        
        try {
          await upsertReport(rel);
          sucessos++;
        } catch (error) {
          console.error(`Erro ao salvar relatório do dia ${dia.data}:`, error);
          erros++;
        }
      }

      // Tentar limpar relatórios antigos se houve erros
      if (erros > 0) {
        toast.warning("Alguns registros falharam. Tentando limpar relatórios antigos...");
        await clearOldReports();
        
        // Tentar novamente os que falharam
        for (const dia of diasComServicos) {
          if (erros > 0) {
            const now = Date.now();
            const id = uuidv4();
            
            const servicos = dia.servicos.map(servico => ({
              assunto: servico,
              fotos: (dia.fotos[servico] || []).map(url => ({ url, descricao: "" })),
              observacao: ""
            }));
            
            const rel: RotineirosRelatorio = {
              id,
              tipoServico: "ROTINEIROS",
              assunto,
              data: dia.data,
              sub,
              servicos,
              createdAt: now,
              updatedAt: now,
            };
            
            try {
              await upsertReport(rel);
              sucessos++;
              erros--;
            } catch (retryError) {
              console.error(`Erro persistente no dia ${dia.data}:`, retryError);
            }
          }
        }
      }

      if (sucessos > 0) {
        toast.success(`${sucessos} relatório(s) salvo(s) com sucesso!`);
        if (erros > 0) {
          toast.error(`${erros} relatório(s) falharam. Verifique o console para detalhes.`);
        }
        setTimeout(() => {
          window.location.href = `/relatorios`;
        }, 2000);
      } else {
        toast.error("Nenhum relatório foi salvo. Tente novamente com menos fotos.");
      }

    } catch (error) {
      console.error("Erro geral ao salvar relatórios:", error);
      toast.error("Erro ao salvar relatórios. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-6">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">⚡ Registro em Lote - Serviços Rotineiros</h1>
              <p className="text-blue-100">Registre múltiplos dias de serviços rotineiros de uma vez</p>
            </div>
          </div>
        </div>

        {/* Configurações do período */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📅 Configuração do Período
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-black dark:text-zinc-400 font-bold">Assunto</label>
              <input 
                value={assunto} 
                disabled 
                className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 cursor-not-allowed font-semibold" 
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-black dark:text-zinc-400 font-bold">Subprefeitura</label>
              <select 
                value={sub} 
                onChange={(e) => setSub(e.target.value as SubRegiao)} 
                className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
              >
                <option value="SP">{SUB_REGIOES.SP}</option>
                <option value="CV">{SUB_REGIOES.CV}</option>
                <option value="JT">{SUB_REGIOES.JT}</option>
                <option value="MG">{SUB_REGIOES.MG}</option>
                <option value="ST">{SUB_REGIOES.ST}</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-black dark:text-zinc-400 font-bold">Data Início</label>
              <CustomDatePicker
                selectedDate={dataInicio}
                onChange={setDataInicio}
                placeholder="Selecione a data início"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-black dark:text-zinc-400 font-bold">Data Fim</label>
              <CustomDatePicker
                selectedDate={dataFim}
                onChange={setDataFim}
                placeholder="Selecione a data fim"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={handlePeriodoChange}
              disabled={!dataInicio || !dataFim}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2"
            >
              🔄 Gerar Dias do Período
            </button>
            
            {diasServicos.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>📊 {diasServicos.length} dias gerados</span>
                <span>•</span>
                <span>{diasServicos.filter(d => d.servicos.length > 0).length} com serviços</span>
              </div>
            )}
          </div>
        </div>

        {/* Lista de dias e serviços */}
        {diasServicos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              📋 Serviços por Dia
            </h2>
            
            <div className="space-y-6">
              {diasServicos.map((dia, diaIndex) => (
                <div key={dia.data} className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      📅 {formatarData(dia.data)}
                    </h3>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {dia.servicos.length} serviço(s) selecionado(s)
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SERVICOS_MUTIRAO.map((servico) => (
                      <div key={servico} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`servico-${diaIndex}-${servico}`}
                            checked={dia.servicos.includes(servico)}
                            onChange={() => toggleServicoDia(diaIndex, servico)}
                            className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                          />
                          <label 
                            htmlFor={`servico-${diaIndex}-${servico}`} 
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-300 cursor-pointer"
                          >
                            {servico}
                          </label>
                        </div>
                        
                        {dia.servicos.includes(servico) && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                Fotos: {dia.fotos[servico]?.length || 0}/10
                              </span>
                              <button
                                onClick={() => addFotoServicoDia(diaIndex, servico)}
                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
                              >
                                📸 Adicionar Fotos
                              </button>
                            </div>
                            
                            {dia.fotos[servico] && dia.fotos[servico].length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {dia.fotos[servico].map((foto, fotoIndex) => (
                                  <div key={fotoIndex} className="relative">
                                    <img
                                      src={foto}
                                      alt={`${servico} - Foto ${fotoIndex + 1}`}
                                      className="w-full h-20 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                                    />
                                    <button
                                      onClick={() => removeFotoServicoDia(diaIndex, servico, fotoIndex)}
                                      className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="pt-4 flex gap-3">
          <button 
            onClick={salvarTodos} 
            disabled={saving || diasServicos.filter(d => d.servicos.length > 0).length === 0}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded flex items-center gap-2 font-semibold"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                💾 Salvar Todos os Registros
              </>
            )}
          </button>
          <button 
            onClick={() => window.history.back()} 
            className="bg-zinc-600 hover:bg-zinc-500 text-white px-6 py-3 rounded font-semibold"
          >
            Voltar
          </button>
        </div>

        {/* Resumo */}
        {diasServicos.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              📊 Resumo do Registro em Lote
            </h3>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div><strong>Período:</strong> {dataInicio?.toLocaleDateString('pt-BR')} a {dataFim?.toLocaleDateString('pt-BR')}</div>
              <div><strong>Subprefeitura:</strong> {SUB_REGIOES[sub]}</div>
              <div><strong>Total de dias:</strong> {diasServicos.length}</div>
              <div><strong>Dias com serviços:</strong> {diasServicos.filter(d => d.servicos.length > 0).length}</div>
              <div><strong>Total de serviços:</strong> {diasServicos.reduce((acc, dia) => acc + dia.servicos.length, 0)}</div>
              <div><strong>Total de fotos:</strong> {diasServicos.reduce((acc, dia) => 
                acc + Object.values(dia.fotos).reduce((fotos, arr) => fotos + arr.length, 0), 0
              )}</div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
