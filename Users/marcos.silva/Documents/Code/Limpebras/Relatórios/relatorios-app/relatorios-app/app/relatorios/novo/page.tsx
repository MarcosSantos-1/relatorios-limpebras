"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { MutiraoRelatorio, SubRegiao, SERVICOS_MUTIRAO, SUB_REGIOES } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

function emptyQuantitativo() {
  return [
    { descricao: "Colaboradores (quant.)", quantidade: "", tipo: "quantidade" },
    { descricao: "Equipamentos (quant.)", quantidade: "", tipo: "quantidade" },
    { descricao: "Varrição (km)", quantidade: "", tipo: "decimal" },
    { descricao: "Pintura de guias (km)", quantidade: "", tipo: "decimal" },
    { descricao: "Capinação (km)", quantidade: "", tipo: "decimal" },
    { descricao: "Bocas de lobo e bueiros limpos (unid)", quantidade: "", tipo: "quantidade" },
    { descricao: "Lixeiras instaladas/repostas (unid)", quantidade: "", tipo: "quantidade" },
    { descricao: "Lixeiras higienizadas (unid)", quantidade: "", tipo: "quantidade" },
    { descricao: "Água utilizada (m3)", quantidade: "", tipo: "decimal" },
    { descricao: "Remoção de faixas e propagandas (unid)", quantidade: "", tipo: "quantidade" },
    { descricao: "Volume de resíduos coletados (Ton.)* Estimativa", quantidade: "", tipo: "decimal" },
  ];
}

export default function NovoMutiraoPage() {
  const [title, setTitle] = useState("Mutirão - SELIMP");
  const [data, setData] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [equipeFotoUrl, setEquipeFotoUrl] = useState<string>("");
  const [mapaFotoUrl, setMapaFotoUrl] = useState<string>("");
  const [quantitativo, setQuantitativo] = useState(emptyQuantitativo());
  const [informacoes, setInformacoes] = useState<{ ordem: number; descricao: string }[]>([
    { ordem: 1, descricao: "" },
  ]);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [servicosFotos, setServicosFotos] = useState<Record<string, { antes: string; durante: string; depois: string }>>({});

  function addInfoRow() {
    setInformacoes((prev) => [...prev, { ordem: prev.length + 1, descricao: "" }]);
  }

  function toggleServico(servico: string) {
    setServicosSelecionados(prev => {
      if (prev.includes(servico)) {
        const newFotos = { ...servicosFotos };
        delete newFotos[servico];
        setServicosFotos(newFotos);
        
        // Remove o serviço das informações se existir
        setInformacoes(currentInfo => 
          currentInfo.filter(info => info.descricao !== servico)
        );
        
        return prev.filter(s => s !== servico);
      } else {
        setServicosFotos(prev => ({
          ...prev,
          [servico]: { antes: "", durante: "", depois: "" }
        }));
        
        // Adiciona automaticamente o serviço nas informações
        setInformacoes(currentInfo => {
          // Verifica se o serviço já existe nas informações
          const alreadyExists = currentInfo.some(info => info.descricao === servico);
          if (alreadyExists) {
            return currentInfo; // Não adiciona se já existe
          }
          
          // Se a primeira linha está vazia, substitui ela
          if (currentInfo.length === 1 && currentInfo[0].descricao === "") {
            return [{
              ordem: 1,
              descricao: servico
            }];
          } else {
            // Senão, adiciona uma nova linha
            const newInfo = [...currentInfo];
            newInfo.push({
              ordem: newInfo.length + 1,
              descricao: servico
            });
            return newInfo;
          }
        });
        
        return [...prev, servico];
      }
    });
  }

  function updateServicoFoto(servico: string, etapa: 'antes' | 'durante' | 'depois', url: string) {
    setServicosFotos(prev => ({
      ...prev,
      [servico]: { ...prev[servico], [etapa]: url }
    }));
  }

  function handleMultipleFileUpload(files: FileList, servico: string) {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 3) {
      // Upload de 3 fotos: antes, durante, depois
      fileArray.forEach((file, index) => {
        const etapas = ['antes', 'durante', 'depois'] as const;
        handleFileUpload(file, (url) => updateServicoFoto(servico, etapas[index], url));
      });
    } else if (fileArray.length === 2) {
      // Upload de 2 fotos: antes, depois
      fileArray.forEach((file, index) => {
        const etapas = ['antes', 'depois'] as const;
        handleFileUpload(file, (url) => updateServicoFoto(servico, etapas[index], url));
      });
    } else if (fileArray.length === 1) {
      // Upload de 1 foto: antes
      handleFileUpload(fileArray[0], (url) => updateServicoFoto(servico, 'antes', url));
    }
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

  function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calcular novas dimensões mantendo proporção
          let { width, height } = img;
          // Reduzir drasticamente o tamanho
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          // Garantir que não seja muito grande
          const maxHeight = 600;
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Desenhar imagem redimensionada
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // Converter para base64 com compressão
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          console.log(`📸 Imagem comprimida: ${file.size} bytes → ${compressedDataUrl.length} bytes`);
          console.log(`📸 URL gerada: ${compressedDataUrl.substring(0, 100)}...`);
          resolve(compressedDataUrl);
        } catch (error) {
          console.error('Erro ao comprimir imagem:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Erro ao carregar imagem para compressão:', error);
        reject(error);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFileUpload(file: File, callback: (url: string) => void) {
    // Sem limite de tamanho - futuro backend vai resolver
    compressImage(file, 800, 0.8)
      .then(callback)
      .catch((error) => {
        console.error('Erro no upload da imagem:', error);
        toast.error('Erro ao processar imagem. Tente novamente.');
      });
  }

  async function save() {
    // Validações obrigatórias
    if (!data) {
      toast.error("Por favor, selecione a data do mutirão.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    // Converter serviços selecionados para formato do relatório
    const servicos = servicosSelecionados.map(servico => ({
      assunto: servico,
      fotos: [
        ...(servicosFotos[servico]?.antes ? [{ url: servicosFotos[servico].antes, etapa: "ANTES" as const, descricao: "Antes" }] : []),
        ...(servicosFotos[servico]?.durante ? [{ url: servicosFotos[servico].durante, etapa: "DURANTE" as const, descricao: "Durante" }] : []),
        ...(servicosFotos[servico]?.depois ? [{ url: servicosFotos[servico].depois, etapa: "DEPOIS" as const, descricao: "Depois" }] : []),
      ]
    }));

    console.log("Serviços selecionados:", servicosSelecionados);
    console.log("Fotos dos serviços:", servicosFotos);
    console.log("Serviços processados:", servicos);

    // Converter data para formato ISO
    const dataISO = data.toISOString().split('T')[0];

    const rel: MutiraoRelatorio = {
      id,
      tipoServico: "MUTIRAO",
      title: title || "Mutirão - SELIMP",
      data: dataISO,
      quantitativo: quantitativo,
      secoes: [
        {
          sub,
          local,
          descricao,
          data: dataISO,
          equipeFotoUrl,
          mapaFotoUrl,
          informacoes,
          servicos,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    
    console.log("Relatório a ser salvo:", rel);
    
    try {
      await upsertReport(rel);
      toast.success("Relatório salvo com sucesso!");
      window.location.href = `/relatorios`;
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      toast.error("Erro ao salvar. Tentando limpar relatórios antigos...");
      await clearOldReports();
      try {
        await upsertReport(rel);
        toast.success("Relatório salvo com sucesso!");
        window.location.href = `/relatorios`;
      } catch (retryError) {
        toast.error("Erro persistente. Por favor, tente novamente com menos fotos.");
        console.error("Erro persistente:", retryError);
      }
    }
  }

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
            <h1 className="text-2xl font-bold">🏗️ Novo Relatório de Mutirão</h1>
            <p className="text-green-100">Registre as atividades de limpeza e manutenção urbana</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Tipo de Serviço</label>
          <select value={title} disabled className="bg-zinc-700 text-zinc-300 px-3 py-2 rounded border border-zinc-600 cursor-not-allowed font-semibold">
            <option value="Mutirão - SELIMP">Mutirão - SELIMP</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Data</label>
            <CustomDatePicker
              selectedDate={data}
              onChange={setData}
              placeholder="Selecione a data do mutirão"
            />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Sub-região</label>
          <select value={sub} onChange={(e) => setSub(e.target.value as SubRegiao)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md">
            <option value="SP">{SUB_REGIOES.SP}</option>
            <option value="CV">{SUB_REGIOES.CV}</option>
            <option value="JT">{SUB_REGIOES.JT}</option>
            <option value="MG">{SUB_REGIOES.MG}</option>
            <option value="ST">{SUB_REGIOES.ST}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Local / Evento</label>
          <input value={local} onChange={(e) => setLocal(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-black dark:text-zinc-400 font-bold">Descrição do Mutirão (sub)</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 min-h-24 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" />
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Fotos (opcional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Foto da Equipe */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Foto da Equipe</h3>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setEquipeFotoUrl);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="equipe-foto"
                />
                <label 
                  htmlFor="equipe-foto"
                  className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                      <span className="font-medium">Clique para adicionar</span><br />
                      foto da equipe
                    </p>
                  </div>
                </label>
              </div>
              {equipeFotoUrl && (
                <div className="w-20 h-20 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                  <img src={equipeFotoUrl} alt="Foto da equipe" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Foto do Mapa */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Foto do Mapa</h3>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setMapaFotoUrl);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="mapa-foto"
                />
                <label 
                  htmlFor="mapa-foto"
                  className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                      <span className="font-medium">Clique para adicionar</span><br />
                      foto do mapa
                    </p>
                  </div>
                </label>
              </div>
              {mapaFotoUrl && (
                <div className="w-20 h-20 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                  <img src={mapaFotoUrl} alt="Foto do mapa" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Quantitativo estimado (capa)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quantitativo.map((q, idx) => {
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
                    const formattedVal = formatQuantitativo(e.target.value, q.tipo);
                    setQuantitativo((prev) => {
                      const copy = [...prev];
                      copy[idx] = { ...copy[idx], quantidade: formattedVal };
                      return copy;
                    });
                  }}
                  onBlur={(e) => {
                    const formattedVal = formatQuantitativoOnBlur(e.target.value, q.tipo);
                    if (formattedVal !== e.target.value) {
                      setQuantitativo((prev) => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], quantidade: formattedVal };
                        return copy;
                      });
                    }
                  }}
                  className={`px-3 py-2 rounded border w-1/3 font-semibold transition-all duration-200 ${
                    isHighlighted 
                      ? 'bg-purple-200 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 focus:shadow-md' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md'
                  }`}
                  placeholder={isDecimal ? "0,0" : "0"}
                  type="text"
                  inputMode={isDecimal ? "decimal" : "numeric"}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">INFORMAÇÕES (sub)</h2>
        <div className="space-y-2">
          {informacoes.map((it, idx) => {
            const isAutoGenerated = SERVICOS_MUTIRAO.includes(it.descricao as any);
            return (
              <div key={idx} className="flex gap-2">
                <span className="w-10 text-zinc-400">{it.ordem}.</span>
                <input
                  value={it.descricao}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInformacoes((prev) => {
                      const copy = [...prev];
                      copy[idx] = { ...copy[idx], descricao: val };
                      return copy;
                    });
                  }}
                  disabled={isAutoGenerated}
                  className={`flex-1 px-3 py-2 rounded border font-semibold transition-all duration-200 ${
                    isAutoGenerated 
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-600 cursor-not-allowed' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md'
                  }`}
                  placeholder={isAutoGenerated ? "Preenchido automaticamente" : "Descrição do item"}
                />
                {isAutoGenerated && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                    🤖 Auto
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">Serviços Executados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SERVICOS_MUTIRAO.map((servico) => (
            <label key={servico} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={servicosSelecionados.includes(servico)}
                onChange={() => toggleServico(servico)}
                className="w-4 h-4 text-indigo-600 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{servico}</span>
            </label>
          ))}
        </div>
      </section>

      {servicosSelecionados.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-medium">Fotos dos Serviços</h2>
          {servicosSelecionados.map((servico) => (
            <div key={servico} className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-zinc-200">{servico}</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleMultipleFileUpload(files, servico);
                      }
                    }}
                    className="hidden"
                    id={`multiple-${servico}`}
                  />
                  <label 
                    htmlFor={`multiple-${servico}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs cursor-pointer transition-colors"
                  >
                    📸 Upload múltiplo
                  </label>
                </div>
              </div>
              <div className="text-xs text-zinc-400 mb-2">
                💡 Dica: Use &quot;Upload múltiplo&quot; para adicionar 1, 2 ou 3 fotos de uma vez (antes/durante/depois)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['antes', 'durante', 'depois'].map((etapa) => (
                  <div key={etapa} className="space-y-2">
                    <label className="text-xs text-zinc-600 dark:text-zinc-400 capitalize font-medium">{etapa}</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (url) => updateServicoFoto(servico, etapa as 'antes' | 'durante' | 'depois', url));
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id={`${servico}-${etapa}`}
                      />
                      <label 
                        htmlFor={`${servico}-${etapa}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-600 rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-750 hover:border-indigo-500 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-zinc-400 text-center">
                            <span className="font-medium">Clique para adicionar</span><br />
                            foto da etapa {etapa}
                          </p>
                        </div>
                      </label>
                    </div>
                    {servicosFotos[servico]?.[etapa as keyof typeof servicosFotos[typeof servico]] && (
                      <div className="w-full h-32 border border-zinc-600 rounded overflow-hidden mt-2">
                        <img 
                          src={servicosFotos[servico][etapa as keyof typeof servicosFotos[typeof servico]]} 
                          alt={`${servico} - ${etapa}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="pt-2 flex gap-3">
        <button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          💾 Salvar
        </button>
        <button onClick={() => window.history.back()} className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded">
          Voltar
        </button>
      </div>
    </div>
    </RoleGuard>
  );        
}


