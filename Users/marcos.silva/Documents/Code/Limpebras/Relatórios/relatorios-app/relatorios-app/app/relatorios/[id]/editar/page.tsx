"use client";
import { useState, useEffect, use } from "react";
import { getReport, upsertReport } from "@/lib/storage";
import { Relatorio, MutiraoRelatorio, RegistroRelatorio, RevitalizacaoRelatorio, DDSRelatorio, MonumentosRelatorio, EventosRelatorio, RotineirosRelatorio, FotoEtapa, SubRegiao } from "@/lib/types";
import { SUB_REGIOES, SERVICOS_MUTIRAO, SERVICOS_DDS } from "@/lib/types";
import { toast } from 'react-toastify';

export default function EditarRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        console.log('🔍 Carregando relatório para edição com ID:', id);
        const rel = await getReport(id);
        console.log('📊 Relatório carregado para edição:', rel);
        if (rel) {
          setRelatorio(rel);
          setError("");
        } else {
          setError("Relatório não encontrado");
        }
      } catch (error) {
        console.error('❌ Erro ao carregar relatório para edição:', error);
        setError("Erro ao carregar relatório");
      } finally {
        setLoading(false);
      }
    };
    
    loadReport();
  }, [id]);

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

  async function handleFileUpload(file: File, callback: (url: string) => void) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("📁 Arquivo muito grande. Máximo 5MB.", {
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
    
    try {
      const compressedUrl = await compressImage(file);
      callback(compressedUrl);
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      toast.error("❌ Erro ao processar imagem.", {
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
    }
  }

  function formatPeso(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para número e formata com separador de milhares
    const num = parseInt(numbers);
    const formatted = num.toLocaleString('pt-BR');
    
    return `${formatted} kg`;
  }

  function formatQuantitativo(value: string, tipo: string): string {
    if (!value) return "";
    
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    if (tipo === "quantidade") {
      // Para quantidades, apenas números inteiros
      return cleanValue.replace(/[^\d]/g, '');
    } else {
      // Para decimais, permitir vírgula ou ponto
      const parts = cleanValue.split(/[,.]/);
      if (parts.length > 2) {
        // Se tem mais de um separador, mantém apenas o primeiro
        return parts[0] + ',' + parts.slice(1).join('');
      }
      return cleanValue.replace('.', ','); // Converte ponto para vírgula
    }
  }

  function formatQuantitativoOnBlur(value: string, tipo: string): string {
    if (!value || value.trim() === "") return "";
    
    if (tipo === "decimal") {
      // Para decimais, se não tem vírgula, adiciona ",00"
      if (!value.includes(',') && !value.includes('.')) {
        return value + ',00';
      }
      // Se tem vírgula mas não tem casas decimais, adiciona "00"
      if (value.includes(',') && value.split(',')[1] === '') {
        return value + '00';
      }
      // Se tem vírgula mas só uma casa decimal, adiciona "0"
      if (value.includes(',') && value.split(',')[1].length === 1) {
        return value + '0';
      }
    }
    
    return value;
  }

  function handlePesoChange(value: string) {
    // Remove "kg" e espaços para processar apenas números
    const cleanValue = value.replace(/[^\d]/g, '');
    const formatted = formatPeso(cleanValue);
    setRelatorio({
      ...relatorio,
      peso: formatted
    } as RevitalizacaoRelatorio);
  }

  async function handleSave() {
    if (!relatorio) return;
    
    setSaving(true);
    try {
      const updatedRelatorio = {
        ...relatorio,
        updatedAt: Date.now()
      };
      
      await upsertReport(updatedRelatorio);
      toast.success("Relatório atualizado com sucesso!");
      window.location.href = `/relatorios/${id}`;
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar relatório.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-zinc-600 dark:text-zinc-400">Carregando relatório...</div>
      </div>
    );
  }

  if (error || !relatorio) {
    return (
      <div className="p-4">
        <div className="text-red-600 dark:text-red-400">Erro: {error || "Relatório não encontrado"}</div>
        <button 
          onClick={() => window.location.href = `/relatorios`}
          className="mt-4 px-3 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  const isMutirao = relatorio.tipoServico === "MUTIRAO";
  const isRegistro = ["ACUMULADOR", "ALAGAMENTOS", "ZELADORIA", "HIGIENIZACAO", "VARRICAO_MECANIZADA", "FEIRAS"].includes(relatorio.tipoServico);
  const isRevitalizacao = relatorio.tipoServico === "REVITALIZACAO";
  const isDDS = relatorio.tipoServico === "DDS";
  const isEventos = relatorio.tipoServico === "EVENTOS";
  const isRotineiros = relatorio.tipoServico === "ROTINEIROS";

  return (
    <div className="space-y-6">
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">✏️ Editar Relatório</h1>
            <p className="text-blue-100">
              {isMutirao && "Edite as informações do mutirão"}
              {isRegistro && "Edite as informações do registro"}
              {isRevitalizacao && "Edite as informações da revitalização"}
              {isRotineiros && "Edite as informações dos serviços rotineiros"}
              {isDDS && "Edite as informações do DDS"}
              {isEventos && "Edite as informações dos eventos"}
            </p>
          </div>
          <button 
            onClick={() => window.location.href = `/relatorios/${id}`}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
        </div>
      </div>

      {/* Formulário de edição baseado no tipo */}
      {isMutirao && (
        <div className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Dados do Mutirão</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data</label>
                <input
                  type="date"
                  value={(relatorio as MutiraoRelatorio).data}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    data: e.target.value
                  } as MutiraoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Título</label>
                <input
                  type="text"
                  value={(relatorio as MutiraoRelatorio).title}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    title: e.target.value
                  } as MutiraoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Quantitativo Estimado */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Quantitativo Estimado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(relatorio as MutiraoRelatorio).quantitativo.map((q, idx) => {
                const isDecimal = q.tipo === "decimal";
                const isHighlighted = q.descricao.includes("Colaboradores") || 
                                     q.descricao.includes("Varrição") || 
                                     q.descricao.includes("Bocas de lobo") || 
                                     q.descricao.includes("Volume de resíduos");
                
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className={`text-sm w-2/3 font-semibold ${isHighlighted ? 'text-purple-800 dark:text-purple-300' : 'text-zinc-900 dark:text-zinc-300'}`}>
                      {q.descricao}
                    </div>
                    <input
                      value={q.quantidade as string}
                      onChange={(e) => {
                        const formattedVal = formatQuantitativo(e.target.value, q.tipo || "quantidade");
                        const newQuantitativo = [...(relatorio as MutiraoRelatorio).quantitativo];
                        newQuantitativo[idx].quantidade = formattedVal;
                        setRelatorio({
                          ...relatorio,
                          quantitativo: newQuantitativo
                        } as MutiraoRelatorio);
                      }}
                      onBlur={(e) => {
                        const formattedVal = formatQuantitativoOnBlur(e.target.value, q.tipo || "quantidade");
                        if (formattedVal !== e.target.value) {
                          const newQuantitativo = [...(relatorio as MutiraoRelatorio).quantitativo];
                          newQuantitativo[idx].quantidade = formattedVal;
                          setRelatorio({
                            ...relatorio,
                            quantitativo: newQuantitativo
                          } as MutiraoRelatorio);
                        }
                      }}
                      className={`px-3 py-2 rounded border w-1/3 font-semibold transition-all duration-200 ${
                        isHighlighted 
                          ? 'bg-purple-200 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 focus:shadow-md' 
                          : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md'
                      }`}
                      placeholder={isDecimal ? "0,0" : "0"}
                      type="text"
                      inputMode={isDecimal ? "decimal" : "numeric"}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seções do Mutirão */}
          {(relatorio as MutiraoRelatorio).secoes.map((secao, secaoIdx) => (
            <div key={secaoIdx} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
              <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Seção {secaoIdx + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Sub-região</label>
                  <select
                    value={secao.sub}
                    onChange={(e) => {
                      const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                      newSecoes[secaoIdx].sub = e.target.value as SubRegiao;
                      setRelatorio({
                        ...relatorio,
                        secoes: newSecoes
                      } as MutiraoRelatorio);
                    }}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                  >
                    <option value="SP">{SUB_REGIOES.SP}</option>
                    <option value="CV">{SUB_REGIOES.CV}</option>
                    <option value="JT">{SUB_REGIOES.JT}</option>
                    <option value="MG">{SUB_REGIOES.MG}</option>
                    <option value="ST">{SUB_REGIOES.ST}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Local</label>
                  <input
                    type="text"
                    value={secao.local}
                    onChange={(e) => {
                      const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                      newSecoes[secaoIdx].local = e.target.value;
                      setRelatorio({
                        ...relatorio,
                        secoes: newSecoes
                      } as MutiraoRelatorio);
                    }}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Descrição</label>
                <textarea
                  value={secao.descricao}
                  onChange={(e) => {
                    const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                    newSecoes[secaoIdx].descricao = e.target.value;
                    setRelatorio({
                      ...relatorio,
                      secoes: newSecoes
                    } as MutiraoRelatorio);
                  }}
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Foto da Equipe</label>
                {secao.equipeFotoUrl && (
                  <div className="mb-2 flex items-center gap-2">
                    <img src={secao.equipeFotoUrl} alt="Foto da equipe" className="w-32 h-32 object-cover rounded border border-zinc-300 dark:border-zinc-600" />
                    <button
                      onClick={() => {
                        const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                        newSecoes[secaoIdx].equipeFotoUrl = "";
                        setRelatorio({
                          ...relatorio,
                          secoes: newSecoes
                        } as MutiraoRelatorio);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, (url) => {
                        const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                        newSecoes[secaoIdx].equipeFotoUrl = url;
                        setRelatorio({
                          ...relatorio,
                          secoes: newSecoes
                        } as MutiraoRelatorio);
                      });
                    }
                  }}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Foto do Mapa</label>
                {secao.mapaFotoUrl && (
                  <div className="mb-2 flex items-center gap-2">
                    <img src={secao.mapaFotoUrl} alt="Foto do mapa" className="w-32 h-32 object-cover rounded border border-zinc-300 dark:border-zinc-600" />
                    <button
                      onClick={() => {
                        const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                        newSecoes[secaoIdx].mapaFotoUrl = "";
                        setRelatorio({
                          ...relatorio,
                          secoes: newSecoes
                        } as MutiraoRelatorio);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, (url) => {
                        const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                        newSecoes[secaoIdx].mapaFotoUrl = url;
                        setRelatorio({
                          ...relatorio,
                          secoes: newSecoes
                        } as MutiraoRelatorio);
                      });
                    }
                  }}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>

              {/* Tabela INFORMAÇÕES */}
              <div className="mb-4">
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">INFORMAÇÕES</label>
                <div className="space-y-2">
                  {secao.informacoes.map((info, infoIdx) => (
                    <div key={infoIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={info.ordem}
                        onChange={(e) => {
                          const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                          newSecoes[secaoIdx].informacoes[infoIdx].ordem = parseInt(e.target.value) || 0;
                          setRelatorio({
                            ...relatorio,
                            secoes: newSecoes
                          } as MutiraoRelatorio);
                        }}
                        className="w-16 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-sm"
                        placeholder="Item"
                      />
                      <input
                        type="text"
                        value={info.descricao}
                        onChange={(e) => {
                          const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                          newSecoes[secaoIdx].informacoes[infoIdx].descricao = e.target.value;
                          setRelatorio({
                            ...relatorio,
                            secoes: newSecoes
                          } as MutiraoRelatorio);
                        }}
                        className="flex-1 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                        placeholder="Descrição do item..."
                      />
                      <button
                        onClick={() => {
                          const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                          newSecoes[secaoIdx].informacoes.splice(infoIdx, 1);
                          setRelatorio({
                            ...relatorio,
                            secoes: newSecoes
                          } as MutiraoRelatorio);
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                      newSecoes[secaoIdx].informacoes.push({
                        ordem: newSecoes[secaoIdx].informacoes.length + 1,
                        descricao: ""
                      });
                      setRelatorio({
                        ...relatorio,
                        secoes: newSecoes
                      } as MutiraoRelatorio);
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded"
                  >
                    Adicionar Item
                  </button>
                </div>
              </div>

              {/* Seleção de Serviços */}
              <div className="mb-4">
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Serviços Executados</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {SERVICOS_MUTIRAO.map((servico) => {
                    const isSelected = secao.servicos.some(s => s.assunto === servico);
                    return (
                      <label key={servico} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                            if (isSelected) {
                              // Remove o serviço
                              newSecoes[secaoIdx].servicos = newSecoes[secaoIdx].servicos.filter(s => s.assunto !== servico);
                            } else {
                              // Adiciona o serviço
                              newSecoes[secaoIdx].servicos.push({
                                assunto: servico,
                                fotos: []
                              });
                            }
                            setRelatorio({
                              ...relatorio,
                              secoes: newSecoes
                            } as MutiraoRelatorio);
                          }}
                          className="w-4 h-4 text-indigo-600 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{servico}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Serviços com Fotos */}
              {secao.servicos.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Fotos dos Serviços</label>
                  <div className="space-y-3">
                    {secao.servicos.map((servico, servicoIdx) => (
                      <div key={servicoIdx} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-zinc-900 dark:text-zinc-200">{servico.assunto}</h4>
                          <button
                            onClick={() => {
                              const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                              newSecoes[secaoIdx].servicos.splice(servicoIdx, 1);
                              setRelatorio({
                                ...relatorio,
                                secoes: newSecoes
                              } as MutiraoRelatorio);
                            }}
                            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-600 dark:hover:bg-red-500 text-red-600 dark:text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                            title="Remover serviço"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {servico.fotos.map((foto, fotoIdx) => (
                            <div key={fotoIdx} className="space-y-2">
                              <div className="relative">
                                <img 
                                  src={foto.url} 
                                  alt={`${servico.assunto} - ${foto.etapa}`} 
                                  className="w-full h-32 object-cover rounded border border-zinc-600" 
                                  onError={(e) => {
                                    console.error('Erro ao carregar imagem:', foto.url);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('Imagem carregada com sucesso:', foto.url.substring(0, 50) + '...');
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                                    newSecoes[secaoIdx].servicos[servicoIdx].fotos.splice(fotoIdx, 1);
                                    setRelatorio({
                                      ...relatorio,
                                      secoes: newSecoes
                                    } as MutiraoRelatorio);
                                  }}
                                  className="absolute top-1 right-1 px-1 py-0.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                                >
                                  ×
                                </button>
                              </div>
                              <input
                                type="text"
                                value={foto.descricao}
                                onChange={(e) => {
                                  const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                                  newSecoes[secaoIdx].servicos[servicoIdx].fotos[fotoIdx].descricao = e.target.value;
                                  setRelatorio({
                                    ...relatorio,
                                    secoes: newSecoes
                                  } as MutiraoRelatorio);
                                }}
                                className="w-full bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-xs"
                                placeholder={`Descrição ${foto.etapa}...`}
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              
                              // Ordenar arquivos por nome para manter ordem numérica
                              const sortedFiles = files.sort((a, b) => {
                                // Extrair números do nome do arquivo para ordenação
                                const getNumber = (filename: string) => {
                                  const match = filename.match(/(\d+)/);
                                  return match ? parseInt(match[1]) : 0;
                                };
                                
                                const numA = getNumber(a.name);
                                const numB = getNumber(b.name);
                                
                                // Se ambos têm números, ordenar por número
                                if (numA > 0 && numB > 0) {
                                  return numA - numB;
                                }
                                
                                // Caso contrário, ordenar alfabeticamente
                                return a.name.localeCompare(b.name);
                              });
                              
                              sortedFiles.forEach((file, index) => {
                                // Usar setTimeout para garantir ordem sequencial
                                setTimeout(() => {
                                  handleFileUpload(file, (url) => {
                                    const newSecoes = [...(relatorio as MutiraoRelatorio).secoes];
                                    newSecoes[secaoIdx].servicos[servicoIdx].fotos.push({
                                      url,
                                      etapa: "Adicional" as FotoEtapa,
                                      descricao: ""
                                    });
                                    setRelatorio({
                                      ...relatorio,
                                      secoes: newSecoes
                                    } as MutiraoRelatorio);
                                  });
                                }, index * 100); // Delay de 100ms entre cada processamento
                              });
                            }}
                            className="w-full bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isRotineiros && (
        <div className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Dados dos Serviços Rotineiros</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Assunto</label>
                <input
                  type="text"
                  value={(relatorio as RotineirosRelatorio).assunto}
                  disabled
                  className="w-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 font-semibold cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data</label>
                <input
                  type="date"
                  value={(relatorio as RotineirosRelatorio).data}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    data: e.target.value
                  } as RotineirosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Sub-região</label>
                <select
                  value={(relatorio as RotineirosRelatorio).sub}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    sub: e.target.value as SubRegiao
                  } as RotineirosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                >
                  <option value="SP">{SUB_REGIOES.SP}</option>
                  <option value="CV">{SUB_REGIOES.CV}</option>
                  <option value="JT">{SUB_REGIOES.JT}</option>
                  <option value="MG">{SUB_REGIOES.MG}</option>
                  <option value="ST">{SUB_REGIOES.ST}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Serviços Executados */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Serviços Executados</h2>
            
            {(relatorio as RotineirosRelatorio).servicos.map((servico, servicoIdx) => (
              <div key={servicoIdx} className="bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-200">{servico.assunto}</h3>
                  <button
                    onClick={() => {
                      const newServicos = [...(relatorio as RotineirosRelatorio).servicos];
                      newServicos.splice(servicoIdx, 1);
                      setRelatorio({
                        ...relatorio,
                        servicos: newServicos
                      } as RotineirosRelatorio);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                  >
                    Remover Serviço
                  </button>
                </div>
                
                {servico.fotos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    {servico.fotos.map((foto, fotoIdx) => (
                      <div key={fotoIdx} className="space-y-2">
                        <div className="relative">
                          <img 
                            src={foto.url} 
                            alt={`${servico.assunto} - Foto ${fotoIdx + 1}`} 
                            className="w-full h-32 object-cover rounded border border-zinc-300 dark:border-zinc-600" 
                          />
                          <button
                            onClick={() => {
                              const newServicos = [...(relatorio as RotineirosRelatorio).servicos];
                              newServicos[servicoIdx].fotos.splice(fotoIdx, 1);
                              setRelatorio({
                                ...relatorio,
                                servicos: newServicos
                              } as RotineirosRelatorio);
                            }}
                            className="absolute top-1 right-1 px-1 py-0.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={foto.descricao}
                          onChange={(e) => {
                            const newServicos = [...(relatorio as RotineirosRelatorio).servicos];
                            newServicos[servicoIdx].fotos[fotoIdx].descricao = e.target.value;
                            setRelatorio({
                              ...relatorio,
                              servicos: newServicos
                            } as RotineirosRelatorio);
                          }}
                          className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-sm"
                          placeholder="Descrição da foto..."
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Fotos: {servico.fotos.length}/10
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      const currentFotos = servico.fotos;
                      const remainingSlots = 10 - currentFotos.length;
                      
                      if (remainingSlots <= 0) {
                        toast.warning('Limite máximo de 10 fotos atingido para este serviço.');
                        return;
                      }
                      
                      const filesToProcess = files.slice(0, remainingSlots);
                      
                      try {
                        const uploadPromises = filesToProcess.map(file => 
                          new Promise<string>((resolve) => {
                            handleFileUpload(file, resolve);
                          })
                        );
                        
                        const urls = await Promise.all(uploadPromises);
                        
                        const newServicos = [...(relatorio as RotineirosRelatorio).servicos];
                        urls.forEach(url => {
                          newServicos[servicoIdx].fotos.push({
                            url,
                            descricao: ""
                          });
                        });
                        
                        setRelatorio({
                          ...relatorio,
                          servicos: newServicos
                        } as RotineirosRelatorio);
                        
                        toast.success(`${urls.length} foto(s) adicionada(s) com sucesso!`);
                      } catch (error) {
                        console.error('Erro ao fazer upload:', error);
                        toast.error('Erro ao fazer upload das fotos.');
                      }
                    }}
                    className="w-full bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 text-sm"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Observação</label>
                  <textarea
                    value={servico.observacao || ""}
                    onChange={(e) => {
                      const newServicos = [...(relatorio as RotineirosRelatorio).servicos];
                      newServicos[servicoIdx].observacao = e.target.value;
                      setRelatorio({
                        ...relatorio,
                        servicos: newServicos
                      } as RotineirosRelatorio);
                    }}
                    rows={2}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                    placeholder="Observações sobre este serviço..."
                  />
                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Adicionar Novo Serviço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {SERVICOS_MUTIRAO.map((servicoNome) => {
                  const jaExiste = (relatorio as RotineirosRelatorio).servicos.some(s => s.assunto === servicoNome);
                  return (
                    <button
                      key={servicoNome}
                      onClick={() => {
                        if (jaExiste) {
                          toast.warning('Este serviço já foi adicionado.');
                          return;
                        }
                        
                        const newServicos = [...(relatorio as RotineirosRelatorio).servicos, {
                          assunto: servicoNome,
                          fotos: [],
                          observacao: ""
                        }];
                        
                        setRelatorio({
                          ...relatorio,
                          servicos: newServicos
                        } as RotineirosRelatorio);
                      }}
                      disabled={jaExiste}
                      className={`p-2 rounded text-sm font-medium transition-colors ${
                        jaExiste 
                          ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-md'
                      }`}
                    >
                      {servicoNome}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDDS && (
        <div className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Dados do DDS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Assunto</label>
                <input
                  type="text"
                  value={(relatorio as DDSRelatorio).assunto}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    assunto: e.target.value
                  } as DDSRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data</label>
                <input
                  type="date"
                  value={(relatorio as DDSRelatorio).data}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    data: e.target.value
                  } as DDSRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Sub-região</label>
                <select
                  value={(relatorio as DDSRelatorio).sub}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    sub: e.target.value as SubRegiao
                  } as DDSRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                >
                  <option value="SP">{SUB_REGIOES.SP}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Local</label>
                <input
                  type="text"
                  value={(relatorio as DDSRelatorio).local || ""}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    local: e.target.value
                  } as DDSRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-zinc-300 mb-1">Descrição</label>
              <textarea
                value={(relatorio as DDSRelatorio).descricao || ""}
                onChange={(e) => setRelatorio({
                  ...relatorio,
                  descricao: e.target.value
                } as DDSRelatorio)}
                rows={3}
                className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 rounded border border-zinc-700 font-semibold"
              />
            </div>
          </div>

          {/* Fotos do DDS organizadas por serviço */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Fotos do DDS por Setor/Serviço</h2>
            
            {(() => {
              // Agrupar fotos por setor/serviço
              const fotosPorSetor = (relatorio as DDSRelatorio).fotos.reduce((acc, foto) => {
                if (!acc[foto.descricao]) {
                  acc[foto.descricao] = [];
                }
                acc[foto.descricao].push(foto);
                return acc;
              }, {} as Record<string, any[]>);
              
              return Object.entries(fotosPorSetor).map(([setor, fotosDoSetor]) => (
                <div key={setor} className="mb-6 p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-200">{setor}</h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {fotosDoSetor.length} fotos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {fotosDoSetor.map((foto, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="relative group">
                          <img src={foto.url} alt={`${setor} - ${idx + 1}`} className="w-full h-20 object-cover rounded border border-zinc-300 dark:border-zinc-600" />
                          <button
                            onClick={() => {
                              const newFotos = (relatorio as DDSRelatorio).fotos.filter(f => f.url !== foto.url);
                              setRelatorio({
                                ...relatorio,
                                fotos: newFotos
                              } as DDSRelatorio);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                            {idx + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Adicionar Fotos ao DDS ({(relatorio as DDSRelatorio).fotos.length}/∞)</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      
                      // Ordenar arquivos por nome para manter ordem numérica
                      const sortedFiles = files.sort((a, b) => {
                        // Extrair números do nome do arquivo para ordenação
                        const getNumber = (filename: string) => {
                          const match = filename.match(/(\d+)/);
                          return match ? parseInt(match[1]) : 0;
                        };
                        
                        const numA = getNumber(a.name);
                        const numB = getNumber(b.name);
                        
                        // Se ambos têm números, ordenar por número
                        if (numA > 0 && numB > 0) {
                          return numA - numB;
                        }
                        
                        // Caso contrário, ordenar alfabeticamente
                        return a.name.localeCompare(b.name);
                      });
                      
                      try {
                        const uploadPromises = sortedFiles.map(file => 
                          new Promise<string>((resolve) => {
                            handleFileUpload(file, resolve);
                          })
                        );
                        
                        const urls = await Promise.all(uploadPromises);
                        
                        const newFotos = [...(relatorio as DDSRelatorio).fotos];
                        urls.forEach((url, index) => {
                          newFotos.push({
                            url,
                            descricao: "DDS", // Descrição padrão, pode ser alterada depois
                            ordem: (relatorio as DDSRelatorio).fotos.length + index + 1
                          });
                        });
                        
                        setRelatorio({
                          ...relatorio,
                          fotos: newFotos
                        } as DDSRelatorio);
                        
                        toast.success(`${urls.length} foto(s) adicionada(s) com sucesso!`);
                      } catch (error) {
                        toast.error('Erro ao fazer upload das fotos.');
                      }
                    }}
                    className="hidden"
                    id="multiple-photo-upload-dds"
                  />
                  <label 
                    htmlFor="multiple-photo-upload-dds" 
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 text-white hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar Foto
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {false && (
        <div className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Dados do Monumento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Assunto</label>
                <input
                  type="text"
                  value={(relatorio as MonumentosRelatorio).assunto}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    assunto: e.target.value
                  } as MonumentosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data</label>
                <input
                  type="date"
                  value={(relatorio as MonumentosRelatorio).data}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    data: e.target.value
                  } as MonumentosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Sub-região</label>
                <select
                  value={(relatorio as MonumentosRelatorio).sub}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    sub: e.target.value as SubRegiao
                  } as MonumentosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                >
                  <option value="CV">Casa Verde / Limão / Cachoeirinha</option>
                  <option value="JT">Jaçanã / Tremembé</option>
                  <option value="MG">Vila Maria / Vila Guilherme</option>
                  <option value="ST">Santana / Tucuruvi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Setor</label>
                <input
                  type="text"
                  value={(relatorio as MonumentosRelatorio).setorSelecionado || ""}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    setorSelecionado: e.target.value
                  } as MonumentosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Monumento</label>
                <input
                  type="text"
                  value={(relatorio as MonumentosRelatorio).monumento || ""}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    monumento: e.target.value
                  } as MonumentosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Local</label>
                <input
                  type="text"
                  value={(relatorio as MonumentosRelatorio).local || ""}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    local: e.target.value
                  } as MonumentosRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-zinc-300 mb-1">Descrição</label>
              <textarea
                value={(relatorio as MonumentosRelatorio).descricao || ""}
                onChange={(e) => setRelatorio({
                  ...relatorio,
                  descricao: e.target.value
                } as MonumentosRelatorio)}
                rows={3}
                className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 rounded border border-zinc-700 font-semibold"
              />
            </div>
          </div>

          {/* Foto da Ficha */}
          {(relatorio as MonumentosRelatorio).fichaFotoUrl && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
              <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Foto da Ficha</h2>
              <div className="relative inline-block">
                <img
                  src={(relatorio as MonumentosRelatorio).fichaFotoUrl}
                  alt="Foto da Ficha"
                  className="w-full max-w-md h-auto rounded border border-zinc-300 dark:border-zinc-600"
                />
                <button
                  onClick={() => setRelatorio({
                    ...relatorio,
                    fichaFotoUrl: ""
                  } as MonumentosRelatorio)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Fotos Fotográficas */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Fotos Fotográficas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { etapa: 'ANTES', label: 'Antes' },
                { etapa: 'DURANTE', label: 'Durante' },
                { etapa: 'DEPOIS', label: 'Depois' }
              ].map(({ etapa, label }) => {
                const foto = (relatorio as MonumentosRelatorio).fotos.find(f => f.etapa === etapa);
                
                return (
                  <div key={etapa} className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {label}
                    </label>
                    {foto ? (
                      <div className="relative">
                        <img
                          src={foto.url}
                          alt={`Foto ${label}`}
                          className="w-full h-40 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                        />
                        <button
                          onClick={() => {
                            const newFotos = (relatorio as MonumentosRelatorio).fotos.filter(f => f.url !== foto.url);
                            setRelatorio({
                              ...relatorio,
                              fotos: newFotos
                            } as MonumentosRelatorio);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-40 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded flex items-center justify-center">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">Sem foto</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isRegistro && (
        <div className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Dados do Registro</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Assunto</label>
                <input
                  type="text"
                  value={(relatorio as RegistroRelatorio).assunto}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    assunto: e.target.value
                  } as RegistroRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Sub-região</label>
                <select
                  value={(relatorio as RegistroRelatorio).sub}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    sub: e.target.value
                  } as RegistroRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                >
                  <option value="SP">{SUB_REGIOES.SP}</option>
                  <option value="CV">{SUB_REGIOES.CV}</option>
                  <option value="JT">{SUB_REGIOES.JT}</option>
                  <option value="MG">{SUB_REGIOES.MG}</option>
                  <option value="ST">{SUB_REGIOES.ST}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data Início</label>
                <input
                  type="date"
                  value={(relatorio as RegistroRelatorio).dataInicio}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    dataInicio: e.target.value
                  } as RegistroRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data Término</label>
                <input
                  type="date"
                  value={(relatorio as RegistroRelatorio).dataTermino}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    dataTermino: e.target.value
                  } as RegistroRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Local</label>
                <input
                  type="text"
                  value={(relatorio as RegistroRelatorio).local}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    local: e.target.value
                  } as RegistroRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-zinc-300 mb-1">Descrição</label>
              <textarea
                value={(relatorio as RegistroRelatorio).descricao}
                onChange={(e) => setRelatorio({
                  ...relatorio,
                  descricao: e.target.value
                } as RegistroRelatorio)}
                rows={3}
                className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 rounded border border-zinc-700 font-semibold"
              />
            </div>
          </div>

          {/* Fotos do Registro */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Fotos do Registro</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {(relatorio as RegistroRelatorio).fotos.map((foto, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="relative">
                    <img src={foto.url} alt={`Foto ${idx + 1}`} className="w-full h-40 object-cover rounded border border-zinc-300 dark:border-zinc-600" />
                    <button
                      onClick={() => {
                        const newFotos = [...(relatorio as RegistroRelatorio).fotos];
                        newFotos.splice(idx, 1);
                        setRelatorio({
                          ...relatorio,
                          fotos: newFotos
                        } as RegistroRelatorio);
                      }}
                      className="absolute top-1 right-1 px-1 py-0.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="text"
                    value={foto.descricao}
                    onChange={(e) => {
                      const newFotos = [...(relatorio as RegistroRelatorio).fotos];
                      newFotos[idx].descricao = e.target.value;
                      setRelatorio({
                        ...relatorio,
                        fotos: newFotos
                      } as RegistroRelatorio);
                    }}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-sm"
                    placeholder="Digite a descrição da foto..."
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Fotos do Registro ({(relatorio as RegistroRelatorio).fotos.length}/20)</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      const currentFotos = (relatorio as RegistroRelatorio).fotos;
                      const remainingSlots = 20 - currentFotos.length;
                      
                      if (remainingSlots <= 0) {
                        toast.warning('Limite máximo de 20 fotos atingido.');
                        return;
                      }
                      
                      const filesToProcess = files.slice(0, remainingSlots);
                      
                      // Ordenar arquivos por nome para manter ordem numérica
                      const sortedFiles = filesToProcess.sort((a, b) => {
                        // Extrair números do nome do arquivo para ordenação
                        const getNumber = (filename: string) => {
                          const match = filename.match(/(\d+)/);
                          return match ? parseInt(match[1]) : 0;
                        };
                        
                        const numA = getNumber(a.name);
                        const numB = getNumber(b.name);
                        
                        // Se ambos têm números, ordenar por número
                        if (numA > 0 && numB > 0) {
                          return numA - numB;
                        }
                        
                        // Caso contrário, ordenar alfabeticamente
                        return a.name.localeCompare(b.name);
                      });
                      
                      try {
                        const uploadPromises = sortedFiles.map(file => 
                          new Promise<string>((resolve) => {
                            handleFileUpload(file, resolve);
                          })
                        );
                        
                        const urls = await Promise.all(uploadPromises);
                        
                        const newFotos = [...currentFotos];
                        urls.forEach((url, index) => {
                          newFotos.push({
                            url,
                            descricao: "",
                            ordem: currentFotos.length + index + 1
                          });
                        });
                        
                        setRelatorio({
                          ...relatorio,
                          fotos: newFotos
                        } as RegistroRelatorio);
                        
                        if (files.length > remainingSlots) {
                          toast.warning(`Apenas ${remainingSlots} fotos foram adicionadas. Limite máximo de 20 fotos.`);
                        } else {
                          toast.success(`${urls.length} foto(s) adicionada(s) com sucesso!`);
                        }
                      } catch (error) {
                        toast.error('Erro ao fazer upload das fotos.');
                      }
                    }}
                    className="hidden"
                    id="multiple-photo-upload-registro"
                    disabled={(relatorio as RegistroRelatorio).fotos.length >= 20}
                  />
                  <label 
                    htmlFor="multiple-photo-upload-registro" 
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-lg ${
                      (relatorio as RegistroRelatorio).fotos.length >= 20 
                        ? 'bg-zinc-500 text-zinc-300 cursor-not-allowed shadow-none' 
                        : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 text-white hover:scale-105'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar Foto
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRevitalizacao && (
        <div className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Dados da Revitalização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Assunto</label>
                <input
                  type="text"
                  value={(relatorio as RevitalizacaoRelatorio).assunto}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    assunto: e.target.value
                  } as RevitalizacaoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Data</label>
                <input
                  type="date"
                  value={(relatorio as RevitalizacaoRelatorio).data}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    data: e.target.value
                  } as RevitalizacaoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Sub-região</label>
                <select
                  value={(relatorio as RevitalizacaoRelatorio).sub}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    sub: e.target.value
                  } as RevitalizacaoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                >
                  <option value="SP">{SUB_REGIOES.SP}</option>
                  <option value="CV">{SUB_REGIOES.CV}</option>
                  <option value="JT">{SUB_REGIOES.JT}</option>
                  <option value="MG">{SUB_REGIOES.MG}</option>
                  <option value="ST">{SUB_REGIOES.ST}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Local</label>
                <input
                  type="text"
                  value={(relatorio as RevitalizacaoRelatorio).local}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    local: e.target.value
                  } as RevitalizacaoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Frequência</label>
                <select
                  value={(relatorio as RevitalizacaoRelatorio).frequencia || ""}
                  onChange={(e) => setRelatorio({
                    ...relatorio,
                    frequencia: e.target.value
                  } as RevitalizacaoRelatorio)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                >
                  <option value="">Selecione a frequência</option>
                  <option value="Bissemanal">Bissemanal</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Diário">Diário</option>
                  <option value="Alternado">Alternado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Peso</label>
                <input
                  type="text"
                  value={(relatorio as RevitalizacaoRelatorio).peso || ""}
                  onChange={(e) => handlePesoChange(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                  placeholder="Digite apenas números (ex: 1000)"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-zinc-300 mb-1">Descrição</label>
              <textarea
                value={(relatorio as RevitalizacaoRelatorio).descricao}
                onChange={(e) => setRelatorio({
                  ...relatorio,
                  descricao: e.target.value
                } as RevitalizacaoRelatorio)}
                rows={3}
                className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 rounded border border-zinc-700 font-semibold"
              />
            </div>
          </div>

          {/* Fotos da Revitalização */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Fotos da Revitalização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {(relatorio as RevitalizacaoRelatorio).fotos.map((foto, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="relative">
                    <img src={foto.url} alt={`${foto.etapa} - ${idx + 1}`} className="w-full h-40 object-cover rounded border border-zinc-300 dark:border-zinc-600" />
                    <button
                      onClick={() => {
                        const newFotos = [...(relatorio as RevitalizacaoRelatorio).fotos];
                        newFotos.splice(idx, 1);
                        setRelatorio({
                          ...relatorio,
                          fotos: newFotos
                        } as RevitalizacaoRelatorio);
                      }}
                      className="absolute top-1 right-1 px-1 py-0.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-400 text-center mb-1">{foto.etapa}</div>
                  <input
                    type="text"
                    value={foto.descricao}
                    onChange={(e) => {
                      const newFotos = [...(relatorio as RevitalizacaoRelatorio).fotos];
                      newFotos[idx].descricao = e.target.value;
                      setRelatorio({
                        ...relatorio,
                        fotos: newFotos
                      } as RevitalizacaoRelatorio);
                    }}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-sm"
                    placeholder="Descrição da foto..."
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Fotos da Revitalização ({(relatorio as RevitalizacaoRelatorio).fotos.length}/3)</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      const currentFotos = (relatorio as RevitalizacaoRelatorio).fotos;
                      const remainingSlots = 3 - currentFotos.length;
                      
                      if (remainingSlots <= 0) {
                        toast.warning('Limite máximo de 3 fotos atingido.');
                        return;
                      }
                      
                      const filesToProcess = files.slice(0, remainingSlots);
                      
                      // Ordenar arquivos por nome para manter ordem numérica
                      const sortedFiles = filesToProcess.sort((a, b) => {
                        // Extrair números do nome do arquivo para ordenação
                        const getNumber = (filename: string) => {
                          const match = filename.match(/(\d+)/);
                          return match ? parseInt(match[1]) : 0;
                        };
                        
                        const numA = getNumber(a.name);
                        const numB = getNumber(b.name);
                        
                        // Se ambos têm números, ordenar por número
                        if (numA > 0 && numB > 0) {
                          return numA - numB;
                        }
                        
                        // Caso contrário, ordenar alfabeticamente
                        return a.name.localeCompare(b.name);
                      });
                      
                      try {
                        const uploadPromises = sortedFiles.map(file => 
                          new Promise<string>((resolve) => {
                            handleFileUpload(file, resolve);
                          })
                        );
                        
                        const urls = await Promise.all(uploadPromises);
                        
                        const newFotos = [...currentFotos];
                        urls.forEach((url, index) => {
                          const etapas = ['ANTES', 'DURANTE', 'DEPOIS'] as const;
                          const etapaIndex = currentFotos.length + index;
                          const etapa = etapas[etapaIndex] || 'ANTES';
                          
                          newFotos.push({
                            url,
                            etapa,
                            descricao: etapa === 'ANTES' ? 'Antes' : etapa === 'DURANTE' ? 'Durante' : 'Depois'
                          });
                        });
                        
                        setRelatorio({
                          ...relatorio,
                          fotos: newFotos
                        } as RevitalizacaoRelatorio);
                        
                        if (files.length > remainingSlots) {
                          toast.warning(`Apenas ${remainingSlots} fotos foram adicionadas. Limite máximo de 3 fotos.`);
                        } else {
                          toast.success(`${urls.length} foto(s) adicionada(s) com sucesso!`);
                        }
                      } catch (error) {
                        toast.error('Erro ao fazer upload das fotos.');
                      }
                    }}
                    className="hidden"
                    id="multiple-photo-upload-revitalizacao"
                    disabled={(relatorio as RevitalizacaoRelatorio).fotos.length >= 3}
                  />
                  <label 
                    htmlFor="multiple-photo-upload-revitalizacao" 
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-lg ${
                      (relatorio as RevitalizacaoRelatorio).fotos.length >= 3 
                        ? 'bg-zinc-500 text-zinc-300 cursor-not-allowed shadow-none' 
                        : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 text-white hover:scale-105'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar Foto
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="pt-2 flex gap-3">
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-lg text-white flex items-center gap-2 font-semibold transition-all duration-200 shadow-lg ${
            saving 
              ? 'bg-green-400 cursor-not-allowed shadow-none' 
              : 'bg-green-600 hover:bg-green-500 hover:shadow-green-500/25 hover:scale-105'
          }`}
        >
          {saving && (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {!saving && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        
        <button 
          onClick={() => window.location.href = `/relatorios/${id}`}
          className="px-6 py-3 bg-zinc-600 hover:bg-zinc-500 hover:shadow-zinc-500/25 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>
    </div>
  );
}