"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RegistroRelatorio, SubRegiao, TipoServico, SERVICOS_REGISTRO, SUB_REGIOES, TIPOS_SERVICO } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { DateRangePicker } from "@/components/DateRangePicker";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

export default function NovoRegistroPage() {
  const [assunto, setAssunto] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<Array<{ url: string; descricao: string }>>([]);

  function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
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
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compressão muito agressiva
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        console.log(`📸 Imagem comprimida: ${file.size} bytes → ${compressedDataUrl.length} bytes`);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFileUpload(file: File, callback: (url: string) => void) {
    // Sem limite de tamanho - futuro backend vai resolver
    compressImage(file, 800, 0.8).then(callback); // Qualidade alta para legibilidade
  }

  function addFoto() {
    setFotos(prev => [...prev, { url: "", descricao: "", ordem: prev.length + 1 }]);
  }

  function removeFoto(index: number) {
    setFotos(prev => prev.filter((_, i) => i !== index));
  }

  function updateFoto(index: number, field: 'url' | 'descricao', value: string) {
    setFotos(prev => prev.map((foto, i) => 
      i === index ? { ...foto, [field]: value, ordem: i + 1 } : foto
    ));
  }

  function handleMultipleFileUpload(files: FileList) {
    const filesArray = Array.from(files);
    
    // Verificar se excede o limite de 20 fotos
    if (fotos.length + filesArray.length > 20) {
      toast.error(`📸 Você pode adicionar no máximo 20 fotos. Atualmente você tem ${fotos.length} foto(s).`, {
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
      return;
    }

    // Ordenar arquivos por nome para manter ordem numérica
    const sortedFiles = filesArray.sort((a, b) => {
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

    // Processar arquivos em sequência para manter ordem
    let currentIndex = fotos.length;
    
    sortedFiles.forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`📁 Arquivo ${file.name} muito grande. Por favor, selecione uma imagem menor que 5MB.`, {
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
        return;
      }
      
      // Usar setTimeout para garantir ordem sequencial
      setTimeout(() => {
        compressImage(file, 800, 0.7).then(url => {
          setFotos(prev => {
            const newFoto = { url, descricao: "", ordem: currentIndex + 1 };
            currentIndex++;
            return [...prev, newFoto];
          });
        });
      }, index * 100); // Delay de 100ms entre cada processamento
    });
  }

  async function save() {
    // Validações obrigatórias
    if (!assunto) {
      toast.error("Por favor, selecione o assunto do relatório.");
      return;
    }
    
    if (!dataInicio) {
      toast.error("Por favor, selecione a data de início.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    // Mapear assunto para tipoServico
    const tipoServicoMap: Record<string, string> = {
      "Acumulador": "ACUMULADOR",
      "Desfazimento": "DESFAZIMENTO", 
      "Alagamentos": "ALAGAMENTOS",
      "Zeladoria": "ZELADORIA",
      "Registros Fotográficos": "REGISTROS_FOTOGRAFICOS"
    };

    const tipoServico = tipoServicoMap[assunto] || "ACUMULADOR"; // Fallback para ACUMULADOR
    
    // Converter datas para formato ISO
    const dataInicioISO = dataInicio.toISOString().split('T')[0];
    const dataTerminoISO = dataTermino ? dataTermino.toISOString().split('T')[0] : dataInicioISO;
    
    console.log("🔍 Debug mapeamento:");
    console.log("- assunto:", assunto);
    console.log("- tipoServico mapeado:", tipoServico);
    console.log("- dataInicio:", dataInicioISO);
    console.log("- dataTermino:", dataTerminoISO);

    const rel: RegistroRelatorio = {
      id,
      title: `${assunto} - ${SUB_REGIOES[sub]} - ${dataInicio.toLocaleDateString('pt-BR')}`,
      tipoServico: tipoServico as TipoServico,
      assunto,
      dataInicio: dataInicioISO,
      dataTermino: dataTerminoISO,
      sub,
      local,
      descricao,
      fotos: fotos.filter(f => f.url).map(f => ({ url: f.url, descricao: f.descricao || "" })),
      createdAt: now,
      updatedAt: now,
    };
    
    console.log("=== SALVANDO REGISTRO ===");
    console.log("Relatório a ser salvo:", rel);
    console.log("Fotos filtradas:", fotos.filter(f => f.url));
    console.log("Tipo de serviço mapeado:", tipoServicoMap[assunto]);
    
    // Verificar tamanho total do documento
    const relString = JSON.stringify(rel);
    const sizeInBytes = new Blob([relString]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    console.log(`📊 Tamanho do documento: ${sizeInBytes} bytes (${sizeInMB.toFixed(2)} MB)`);
    
    // Remover validação de tamanho - futuro backend vai resolver
    console.log(`📊 Tamanho do documento: ${sizeInBytes} bytes (${sizeInMB.toFixed(2)} MB) - Sem validação de limite`);
    
    try {
      console.log("🚀 Chamando upsertReport...");
      const savedRel = await upsertReport(rel);
      console.log("✅ Registro salvo com sucesso! ID:", savedRel.id);
      toast.success("Relatório salvo com sucesso!");
      window.location.href = `/relatorios`;
    } catch (error) {
      console.error("❌ Erro ao salvar relatório:", error);
      toast.error(`Erro ao salvar: ${error}`);
      
      // Tentar limpar relatórios antigos e tentar novamente
      try {
        console.log("🧹 Tentando limpar relatórios antigos...");
        await clearOldReports();
        console.log("🔄 Tentando salvar novamente...");
        const savedRel = await upsertReport(rel);
        console.log("✅ Registro salvo na segunda tentativa! ID:", savedRel.id);
        toast.success("Relatório salvo com sucesso!");
        window.location.href = `/relatorios`;
      } catch (retryError) {
        console.error("❌ Erro persistente:", retryError);
        toast.error(`Erro persistente: ${retryError}. Por favor, tente novamente com menos fotos.`);
      }
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-6">
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">📋 Novo Registro/Evidência</h1>
            <p className="text-blue-100">Documente evidências e registros de serviços executados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Assunto</label>
          <select value={assunto} onChange={(e) => setAssunto(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md">
            <option value="">Selecione o assunto</option>
            {SERVICOS_REGISTRO.map((servico) => (
              <option key={servico} value={servico}>{servico}</option>
            ))}
          </select>
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
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Período</label>
          <DateRangePicker
            startDate={dataInicio}
            endDate={dataTermino}
            onStartDateChange={setDataInicio}
            onEndDateChange={setDataTermino}
            placeholder="Selecione o período"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs text-black dark:text-zinc-400 font-bold">Local / Endereço</label>
          <input value={local} onChange={(e) => setLocal(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-black dark:text-zinc-400 font-bold">Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 min-h-24 font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Fotos do Registro ({fotos.length}/20)</h2>
          <div className="flex items-center gap-3">
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
              id="multiple-photo-upload"
              disabled={fotos.length >= 20}
            />
            <label 
              htmlFor="multiple-photo-upload" 
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-lg ${
                fotos.length >= 20 
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fotos.map((foto, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 space-y-2">
              <div className="flex items-center justify-end">
                <button onClick={() => removeFoto(index)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">Remover</button>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-700 dark:text-zinc-400 font-medium">Upload da Foto</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, (url) => updateFoto(index, 'url', url));
                    }}
                    className="text-sm text-zinc-700 dark:text-zinc-300 w-full bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-medium transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
                  />
                  {foto.url && (
                    <div className="w-full h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                      <img src={foto.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-zinc-700 dark:text-zinc-400 font-medium">Descrição da Foto</label>
                  <input
                    type="text"
                    value={foto.descricao}
                    onChange={(e) => updateFoto(index, 'descricao', e.target.value)}
                    className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 w-full font-semibold transition-all duration-200 focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 focus:shadow-md"
                    placeholder="Descrição da foto"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {fotos.length === 0 && (
            <label 
              htmlFor="multiple-photo-upload" 
              className="flex flex-col items-center justify-center text-center text-zinc-600 dark:text-zinc-400 py-16 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 cursor-pointer hover:border-indigo-500 hover:bg-zinc-200 dark:hover:bg-zinc-900/70 transition-all duration-200 group"
            >
              <svg className="w-16 h-16 mx-auto mb-6 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl font-semibold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">Nenhuma foto adicionada</p>
              <p className="text-base mb-4 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition-colors">Clique aqui ou use o botão acima para adicionar suas evidências</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Fotos
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4">Máximo de 20 fotos por registro</p>
            </label>
          )}
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
