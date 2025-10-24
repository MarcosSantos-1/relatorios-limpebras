"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RotineirosRelatorio, SubRegiao, SERVICOS_MUTIRAO, SUB_REGIOES } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

export default function NovoRotineirosPage() {
  const [assunto, setAssunto] = useState("Serviços Rotineiros");
  const [data, setData] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [servicosFotos, setServicosFotos] = useState<Record<string, string[]>>({});

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

  function toggleServico(servico: string) {
    setServicosSelecionados(prev => {
      if (prev.includes(servico)) {
        // Remover serviço e suas fotos
        const newServicosFotos = { ...servicosFotos };
        delete newServicosFotos[servico];
        setServicosFotos(newServicosFotos);
        return prev.filter(s => s !== servico);
      } else {
        // Adicionar serviço
        return [...prev, servico];
      }
    });
  }

  function addFotoServico(servico: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const currentFotos = servicosFotos[servico] || [];
        
        // Verificar limite de fotos (máximo 10 por serviço)
        if (currentFotos.length + fileArray.length > 10) {
          toast.error(`Máximo de 10 fotos por serviço. Você já tem ${currentFotos.length} foto(s) para este serviço.`);
          return;
        }

        fileArray.forEach((file, index) => {
          handleFileUpload(file, (url) => {
            setServicosFotos(prev => ({
              ...prev,
              [servico]: [...(prev[servico] || []), url]
            }));
          });
        });
      }
    };
    input.click();
  }

  function removeFotoServico(servico: string, index: number) {
    setServicosFotos(prev => ({
      ...prev,
      [servico]: prev[servico]?.filter((_, i) => i !== index) || []
    }));
  }

  async function save() {
    // Validações obrigatórias
    if (!data) {
      toast.error("Por favor, selecione a data dos serviços rotineiros.");
      return;
    }

    if (servicosSelecionados.length === 0) {
      toast.error("Por favor, selecione pelo menos um serviço executado.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    // Converter data para formato ISO
    const dataISO = data.toISOString().split('T')[0];
    
    // Criar serviços com fotos
    const servicos = servicosSelecionados.map(servico => ({
      assunto: servico,
      fotos: (servicosFotos[servico] || []).map(url => ({ url, descricao: "" })),
      observacao: ""
    }));
    
    const rel: RotineirosRelatorio = {
      id,
      tipoServico: "ROTINEIROS",
      assunto,
      data: dataISO,
      sub,
      servicos,
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">🔧 Serviços Rotineiros</h1>
              <p className="text-green-100">Registre serviços rotineiros executados pela equipe</p>
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
              placeholder="Selecione a data dos serviços"
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
        </div>

        <section className="space-y-4">
          <h2 className="font-medium">Serviços Executados</h2>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
            💡 Selecione os serviços executados e adicione fotos para cada um
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICOS_MUTIRAO.map((servico) => (
              <div key={servico} className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`servico-${servico}`}
                    checked={servicosSelecionados.includes(servico)}
                    onChange={() => toggleServico(servico)}
                    className="w-4 h-4 text-green-600 bg-zinc-100 border-zinc-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                  />
                  <label htmlFor={`servico-${servico}`} className="text-sm font-medium text-zinc-900 dark:text-zinc-300 cursor-pointer">
                    {servico}
                  </label>
                </div>
                
                {servicosSelecionados.includes(servico) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Fotos: {servicosFotos[servico]?.length || 0}/10
                      </span>
                      <button
                        onClick={() => addFotoServico(servico)}
                        className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
                      >
                        📸 Adicionar Fotos
                      </button>
                    </div>
                    
                    {servicosFotos[servico] && servicosFotos[servico].length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {servicosFotos[servico].map((foto, index) => (
                          <div key={index} className="relative">
                            <img
                              src={foto}
                              alt={`${servico} - Foto ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                            />
                            <button
                              onClick={() => removeFotoServico(servico, index)}
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
        </section>

        <div className="pt-2 flex gap-3">
          <button onClick={save} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
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
