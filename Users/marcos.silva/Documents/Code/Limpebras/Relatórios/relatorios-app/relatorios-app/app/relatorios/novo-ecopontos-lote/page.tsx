"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RotineirosRelatorio, SubRegiao, ECOPONTOS_POR_SUBREGIAO, SUB_REGIOES } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

interface DiaEcopontos {
  data: string;
  ecopontos: string[];
  fotos: Record<string, string[]>;
}

export default function NovoEcopontosLotePage() {
  const [assunto, setAssunto] = useState("Serviços Rotineiros - Ecopontos");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("CV");
  const [tipoPeriodo, setTipoPeriodo] = useState<"semana" | "mes">("semana");
  const [diasEcopontos, setDiasEcopontos] = useState<DiaEcopontos[]>([]);
  const [saving, setSaving] = useState(false);

  // Gerar lista de dias baseado no período selecionado
  const gerarDiasPeriodo = () => {
    if (!dataInicio || !dataFim) return [];
    
    const dias: DiaEcopontos[] = [];
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
        ecopontos: [],
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
      setDiasEcopontos(novosDias);
    }
  };

  // Selecionar/deselecionar ecoponto para um dia específico
  const toggleEcopontoDia = (diaIndex: number, ecoponto: string) => {
    setDiasEcopontos(prev => {
      const novosDias = [...prev];
      const diaAtual = novosDias[diaIndex];
      
      // Criar uma cópia do dia atual para evitar mutação
      const novoDia = {
        ...diaAtual,
        ecopontos: [...diaAtual.ecopontos]
      };
      
      if (novoDia.ecopontos.includes(ecoponto)) {
        // Remover ecoponto e suas fotos
        const { [ecoponto]: fotosRemovidas, ...outrasFotos } = novoDia.fotos;
        novoDia.ecopontos = novoDia.ecopontos.filter(e => e !== ecoponto);
        novoDia.fotos = outrasFotos;
      } else {
        // Adicionar ecoponto
        novoDia.ecopontos.push(ecoponto);
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

  // Adicionar fotos para um ecoponto específico de um dia
  const addFotoEcopontoDia = (diaIndex: number, ecoponto: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const dia = diasEcopontos[diaIndex];
        const currentFotos = dia.fotos[ecoponto] || [];
        
        // Verificar limite de fotos (máximo 10 por ecoponto)
        if (currentFotos.length + fileArray.length > 10) {
          toast.error(`Máximo de 10 fotos por ecoponto. Você já tem ${currentFotos.length} foto(s) para este ecoponto.`);
          return;
        }

        fileArray.forEach((file, index) => {
          handleFileUpload(file, (url) => {
            setDiasEcopontos(prev => {
              const novosDias = [...prev];
              const novoDia = { ...novosDias[diaIndex] };
              novoDia.fotos = {
                ...novoDia.fotos,
                [ecoponto]: [...(novoDia.fotos[ecoponto] || []), url]
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

  // Remover foto de um ecoponto específico de um dia
  const removeFotoEcopontoDia = (diaIndex: number, ecoponto: string, fotoIndex: number) => {
    setDiasEcopontos(prev => {
      const novosDias = [...prev];
      const novoDia = { ...novosDias[diaIndex] };
      novoDia.fotos = {
        ...novoDia.fotos,
        [ecoponto]: novoDia.fotos[ecoponto]?.filter((_, i) => i !== fotoIndex) || []
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

    if (diasEcopontos.length === 0) {
      toast.error("Nenhum dia foi gerado para o período selecionado.");
      return;
    }

    // Verificar se pelo menos um dia tem ecopontos
    const diasComEcopontos = diasEcopontos.filter(dia => dia.ecopontos.length > 0);
    if (diasComEcopontos.length === 0) {
      toast.error("Por favor, selecione pelo menos um ecoponto para pelo menos um dia.");
      return;
    }

    setSaving(true);
    let sucessos = 0;
    let erros = 0;

    try {
      // Processar cada dia que tem ecopontos
      for (const dia of diasComEcopontos) {
        const now = Date.now();
        const id = uuidv4();
        
        // Criar serviços com fotos para este dia
        const servicos = dia.ecopontos.map(ecoponto => ({
          assunto: ecoponto,
          fotos: (dia.fotos[ecoponto] || []).map(url => ({ url, descricao: ecoponto })),
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
        for (const dia of diasComEcopontos) {
          if (erros > 0) {
            const now = Date.now();
            const id = uuidv4();
            
            const servicos = dia.ecopontos.map(ecoponto => ({
              assunto: ecoponto,
              fotos: (dia.fotos[ecoponto] || []).map(url => ({ url, descricao: ecoponto })),
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

  const ecopontosDisponiveis = ECOPONTOS_POR_SUBREGIAO[sub as keyof typeof ECOPONTOS_POR_SUBREGIAO] || [];

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-6">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">🏭 Registro em Lote - Ecopontos</h1>
              <p className="text-green-100">Registre múltiplos dias de serviços em ecopontos de uma vez</p>
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
              className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2"
            >
              🔄 Gerar Dias do Período
            </button>
            
            {diasEcopontos.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>📊 {diasEcopontos.length} dias gerados</span>
                <span>•</span>
                <span>{diasEcopontos.filter(d => d.ecopontos.length > 0).length} com ecopontos</span>
              </div>
            )}
          </div>
        </div>

        {/* Lista de dias e ecopontos */}
        {diasEcopontos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🏭 Ecopontos por Dia
            </h2>
            
            <div className="space-y-6">
              {diasEcopontos.map((dia, diaIndex) => (
                <div key={dia.data} className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      📅 {formatarData(dia.data)}
                    </h3>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {dia.ecopontos.length} ecoponto(s) selecionado(s)
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ecopontosDisponiveis.map((ecoponto) => (
                      <div key={ecoponto} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`ecoponto-${diaIndex}-${ecoponto}`}
                            checked={dia.ecopontos.includes(ecoponto)}
                            onChange={() => toggleEcopontoDia(diaIndex, ecoponto)}
                            className="w-4 h-4 text-green-600 bg-zinc-100 border-zinc-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                          />
                          <label 
                            htmlFor={`ecoponto-${diaIndex}-${ecoponto}`} 
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-300 cursor-pointer"
                          >
                            {ecoponto}
                          </label>
                        </div>
                        
                        {dia.ecopontos.includes(ecoponto) && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                Fotos: {dia.fotos[ecoponto]?.length || 0}/10
                              </span>
                              <button
                                onClick={() => addFotoEcopontoDia(diaIndex, ecoponto)}
                                className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
                              >
                                📸 Adicionar Fotos
                              </button>
                            </div>
                            
                            {dia.fotos[ecoponto] && dia.fotos[ecoponto].length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {dia.fotos[ecoponto].map((foto, fotoIndex) => (
                                  <div key={fotoIndex} className="relative">
                                    <img
                                      src={foto}
                                      alt={`${ecoponto} - Foto ${fotoIndex + 1}`}
                                      className="w-full h-20 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                                    />
                                    <button
                                      onClick={() => removeFotoEcopontoDia(diaIndex, ecoponto, fotoIndex)}
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
            disabled={saving || diasEcopontos.filter(d => d.ecopontos.length > 0).length === 0}
            className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded flex items-center gap-2 font-semibold"
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
        {diasEcopontos.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              📊 Resumo do Registro em Lote - Ecopontos
            </h3>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div><strong>Período:</strong> {dataInicio?.toLocaleDateString('pt-BR')} a {dataFim?.toLocaleDateString('pt-BR')}</div>
              <div><strong>Subprefeitura:</strong> {SUB_REGIOES[sub]}</div>
              <div><strong>Total de dias:</strong> {diasEcopontos.length}</div>
              <div><strong>Dias com ecopontos:</strong> {diasEcopontos.filter(d => d.ecopontos.length > 0).length}</div>
              <div><strong>Total de ecopontos:</strong> {diasEcopontos.reduce((acc, dia) => acc + dia.ecopontos.length, 0)}</div>
              <div><strong>Total de fotos:</strong> {diasEcopontos.reduce((acc, dia) => 
                acc + Object.values(dia.fotos).reduce((fotos, arr) => fotos + arr.length, 0), 0
              )}</div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
