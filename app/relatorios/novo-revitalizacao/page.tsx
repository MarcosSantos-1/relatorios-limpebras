"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RevitalizacaoRelatorio, SubRegiao, SUB_REGIOES } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

export default function NovoRevitalizacaoPage() {
  const [assunto, setAssunto] = useState("Revitalização de Pontos Viciados");
  const [data, setData] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [peso, setPeso] = useState("");
  const [fotos, setFotos] = useState<{ antes: string; durante: string; depois: string }>({
    antes: "",
    durante: "",
    depois: ""
  });

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
    // Sem limite de tamanho - futuro backend vai resolver
    compressImage(file, 800, 0.8).then(callback); // Qualidade alta para legibilidade
  }

  function updateFoto(etapa: 'antes' | 'durante' | 'depois', url: string) {
    setFotos(prev => ({ ...prev, [etapa]: url }));
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

  function handlePesoChange(value: string) {
    // Remove "kg" e espaços para processar apenas números
    const cleanValue = value.replace(/[^\d]/g, '');
    const formatted = formatPeso(cleanValue);
    setPeso(formatted);
  }

  function handleMultipleFileUpload(files: FileList) {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 3) {
      // Upload de 3 fotos: antes, durante, depois
      fileArray.forEach((file, index) => {
        const etapas = ['antes', 'durante', 'depois'] as const;
        handleFileUpload(file, (url) => updateFoto(etapas[index], url));
      });
    } else if (fileArray.length === 2) {
      // Upload de 2 fotos: antes, depois
      fileArray.forEach((file, index) => {
        const etapas = ['antes', 'depois'] as const;
        handleFileUpload(file, (url) => updateFoto(etapas[index], url));
      });
    } else if (fileArray.length === 1) {
      // Upload de 1 foto: antes
      handleFileUpload(fileArray[0], (url) => updateFoto('antes', url));
    }
  }

  async function save() {
    // Validações obrigatórias
    if (!data) {
      toast.error("Por favor, selecione a data da revitalização.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    const fotosArray = [
      ...(fotos.antes ? [{ url: fotos.antes, etapa: "ANTES" as const, descricao: "Antes" }] : []),
      ...(fotos.durante ? [{ url: fotos.durante, etapa: "DURANTE" as const, descricao: "Durante" }] : []),
      ...(fotos.depois ? [{ url: fotos.depois, etapa: "DEPOIS" as const, descricao: "Depois" }] : []),
    ];
    
    // Converter data para formato ISO
    const dataISO = data.toISOString().split('T')[0];
    
    const rel: RevitalizacaoRelatorio = {
      id,
      tipoServico: "REVITALIZACAO",
      assunto,
      data: dataISO,
      sub,
      local,
      descricao,
      frequencia,
      peso,
      fotos: fotosArray,
      createdAt: now,
      updatedAt: now,
    };
    
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
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">🌱 Nova Revitalização de Pontos Viciados</h1>
            <p className="text-purple-100">Registre ações de revitalização e transformação urbana</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Assunto</label>
          <input value={assunto} disabled className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 cursor-not-allowed font-semibold" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Data</label>
            <CustomDatePicker
              selectedDate={data}
              onChange={setData}
              placeholder="Selecione a data da revitalização"
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
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Local / Endereço</label>
          <input value={local} onChange={(e) => setLocal(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Frequência</label>
          <select value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md">
            <option value="">Selecione a frequência</option>
            <option value="Bissemanal">Bissemanal</option>
            <option value="Semanal">Semanal</option>
            <option value="Diário">Diário</option>
            <option value="Alternado">Alternado</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Peso</label>
          <input value={peso} onChange={(e) => handlePesoChange(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" placeholder="Digite apenas números (ex: 1000)" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-black dark:text-zinc-400 font-bold">Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 min-h-24 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" />
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">Fotos da Revitalização</h2>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleMultipleFileUpload(files);
                }
              }}
              className="hidden"
              id="multiple-revitalizacao"
            />
            <label 
              htmlFor="multiple-revitalizacao"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs cursor-pointer transition-colors"
            >
              📸 Upload múltiplo
            </label>
          </div>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
          💡 Dica: Use &quot;Upload múltiplo&quot; para adicionar 1, 2 ou 3 fotos de uma vez (antes/durante/depois)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['antes', 'durante', 'depois'].map((etapa) => (
            <div key={etapa} className="space-y-2">
              <label className="text-xs text-zinc-700 dark:text-zinc-400 capitalize font-medium">{etapa}</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, (url) => updateFoto(etapa as 'antes' | 'durante' | 'depois', url));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id={`revitalizacao-${etapa}`}
                />
                <label 
                  htmlFor={`revitalizacao-${etapa}`}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                      <span className="font-medium">Clique para adicionar</span><br />
                      foto da etapa {etapa}
                    </p>
                  </div>
                </label>
              </div>
              {fotos[etapa as keyof typeof fotos] && (
                <div className="w-full h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden mt-2">
                  <img 
                    src={fotos[etapa as keyof typeof fotos]} 
                    alt={`Revitalização - ${etapa}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
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
