"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { DDSRelatorio, SERVICOS_DDS } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { DateRangePicker } from "@/components/DateRangePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

export default function NovoDDSPage() {
  const [assunto, setAssunto] = useState("DDS");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<{ url: string; descricao: string; ordem: number }[]>([]);
  const [informacoes, setInformacoes] = useState<{ ordem: number; descricao: string }[]>([
    { ordem: 1, descricao: "" },
  ]);
  const [servicosFotos, setServicosFotos] = useState<Record<string, string[]>>({});

  function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        // Reduzir apenas a largura, preservar altura para georeferência
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com compressão
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log(`📸 Imagem comprimida: ${file.size} bytes → ${compressedDataUrl.length} bytes`);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFileUpload(file: File, callback: (url: string) => void) {
    compressImage(file, 800, 0.8).then(callback);
  }

  function addInfoRow() {
    setInformacoes((prev) => [...prev, { ordem: prev.length + 1, descricao: "" }]);
  }

  function toggleServico(servico: string) {
    // Função para adicionar/remover serviço das informações
    setInformacoes(currentInfo => {
      // Verifica se o serviço já existe nas informações
      const alreadyExists = currentInfo.some(info => info.descricao === servico);
      if (alreadyExists) {
        return currentInfo.filter(info => info.descricao !== servico);
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
  }

  function addServicoFoto(setorIndex: number, url: string) {
    setServicosFotos(prev => ({
      ...prev,
      [`setor_${setorIndex}`]: [...(prev[`setor_${setorIndex}`] || []), url]
    }));
  }

  function removeServicoFoto(setorIndex: number, fotoIndex: number) {
    setServicosFotos(prev => ({
      ...prev,
      [`setor_${setorIndex}`]: prev[`setor_${setorIndex}`]?.filter((_, i) => i !== fotoIndex) || []
    }));
  }

  function handleMultipleFileUpload(files: FileList, setorIndex: number) {
    const fileArray = Array.from(files);
    
    fileArray.forEach((file) => {
      handleFileUpload(file, (url) => addServicoFoto(setorIndex, url));
    });
  }

  async function save() {
    // Validações obrigatórias
    if (!dataInicio || !dataTermino) {
      toast.error("Por favor, selecione o período do DDS.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    // Converter fotos dos serviços para formato do relatório
    const fotosRelatorio = Object.entries(servicosFotos).flatMap(([setorKey, fotosArray]) => {
      const setorIndex = parseInt(setorKey.replace('setor_', ''));
      const setorDescricao = informacoes[setorIndex]?.descricao || `Setor ${setorIndex + 1}`;
      return fotosArray.map((url, index) => ({
        url,
        descricao: setorDescricao,
        ordem: index + 1
      }));
    });

    console.log("Fotos dos serviços:", servicosFotos);
    console.log("Fotos processadas:", fotosRelatorio);

    // Converter datas para formato ISO
    const dataInicioISO = dataInicio.toISOString().split('T')[0];
    const dataTerminoISO = dataTermino.toISOString().split('T')[0];

    const rel: DDSRelatorio = {
      id,
      tipoServico: "DDS",
      assunto: assunto || "DDS",
      data: `${dataInicioISO} a ${dataTerminoISO}`, // Período
      dataInicio: dataInicioISO,
      dataTermino: dataTerminoISO,
      sub: "SP", // Sempre SP para DDS
      local: local || "",
      descricao: descricao || "",
      fotos: fotosRelatorio,
      createdAt: now,
      updatedAt: now,
    };
    
    console.log("Relatório DDS a ser salvo:", rel);
    
    try {
      await upsertReport(rel);
      toast.success("Relatório DDS salvo com sucesso!");
      window.location.href = `/relatorios`;
    } catch (error) {
      console.error("Erro ao salvar relatório DDS:", error);
      toast.error("Erro ao salvar. Tentando limpar relatórios antigos...");
      await clearOldReports();
      try {
        await upsertReport(rel);
        toast.success("Relatório DDS salvo com sucesso!");
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
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">📋 Novo Relatório DDS</h1>
              <p className="text-purple-100">Registre as atividades mensais de DDS dos setores</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-600 dark:text-zinc-400">Tipo de Serviço</label>
            <select value={assunto} disabled className="bg-zinc-700 text-zinc-300 px-3 py-2 rounded border border-zinc-600 cursor-not-allowed font-semibold">
              <option value="DDS">DDS</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Período</label>
            <DateRangePicker
              startDate={dataInicio}
              endDate={dataTermino}
              onStartDateChange={setDataInicio}
              onEndDateChange={setDataTermino}
              placeholder="Selecione o período do DDS"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-black dark:text-zinc-400 font-bold">Sub-região</label>
            <select value="SP" disabled className="bg-zinc-700 text-zinc-300 px-3 py-2 rounded border border-zinc-600 cursor-not-allowed font-semibold">
              <option value="SP">SÃO PAULO</option>
            </select>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="font-medium">INFORMAÇÕES (sub)</h2>
          <div className="space-y-2">
            {informacoes.map((it, idx) => {
              const fotosDoServico = servicosFotos[`setor_${idx}`] || [];
              const totalFotos = fotosDoServico.length;
              const temFotos = totalFotos > 0;
              
              return (
                <div key={idx} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 text-zinc-400 font-semibold">{it.ordem}.</span>
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
                      className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
                      placeholder="Descrição do setor/serviço"
                    />
                    <span className={`text-xs px-2 py-1 rounded-full ${temFotos ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                      {totalFotos} fotos
                    </span>
                  </div>
                  
                  {/* Upload de múltiplas fotos */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleMultipleFileUpload(files, idx);
                          }
                        }}
                        className="hidden"
                        id={`upload-${it.descricao}-${idx}`}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`upload-${it.descricao}-${idx}`)?.click()}
                        className="flex items-center justify-center w-full h-16 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 hover:border-indigo-500 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-6 h-6 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                            📸 Adicionar Fotos (múltiplas)
                          </span>
                        </div>
                      </button>
                    </div>
                    
                    {/* Grid de fotos */}
                    {temFotos && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {fotosDoServico.map((url, fotoIndex) => (
                          <div key={fotoIndex} className="relative group">
                            <div className="w-full h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                              <img 
                                src={url} 
                                alt={`${it.descricao} - ${fotoIndex + 1}`} 
                                className="w-full h-full object-contain" 
                              />
                            </div>
                            <button
                              type="button"
                                onClick={() => removeServicoFoto(idx, fotoIndex)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                              {fotoIndex + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button 
            onClick={addInfoRow} 
            className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-600 dark:hover:bg-blue-500 text-blue-600 dark:text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
            title="Adicionar linha"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </section>

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
