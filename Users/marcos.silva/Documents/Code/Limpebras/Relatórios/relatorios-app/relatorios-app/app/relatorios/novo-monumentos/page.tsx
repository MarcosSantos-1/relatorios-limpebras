"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { MonumentosRelatorio, SubRegiao } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
// Removido CustomDatePicker - usando input comum
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

// Dados dos monumentos por sub-região
const MONUMENTOS_DATA = {
  'CV': [
    { 
      id: 'CV1LM0001', 
      monumento: 'Adhemar Ferreira Da Silva', 
      local: 'Canteiro Central Da Avenida Braz Leme, Altura Do Número 1000' 
    }
  ],
  'JT': [
    { 
      id: 'JT1LM0001', 
      monumento: 'Marechal Do Ar Alberto Santos Dumont', 
      local: 'Praça Comandante Eduardo De Oliveira' 
    },
    { 
      id: 'JT1LM0002', 
      monumento: 'Marco Rodoviário', 
      local: 'Avenida Senador José Ermírio De Moraes (Em Frente À Entrada Do Parque Estadual Da Cantareira Núcleos Águas Claras)' 
    }
  ],
  'MG': [
    { 
      id: 'MG1LM0001', 
      monumento: 'Aos Pracinhas a Homenagem e a Gratidão do Parque Novo Mundo', 
      local: 'Praça Parque Novo Mundo' 
    },
    { 
      id: 'MG1LM0002', 
      monumento: 'Monumento à Legalidade', 
      local: 'Rua Amanbaí, 9 (Interior do III Batalhão de Choque da Polícia Militar de São Paulo)' 
    },
    { 
      id: 'MG1LM0003', 
      monumento: 'Homenagem ao Cão Salomão', 
      local: 'Praça Oscar da Silva' 
    }
  ],
  'ST': [
    { 
      id: 'ST1LM0001', 
      monumento: 'Menorah', 
      local: 'Praça Mashiach Now' 
    },
    { 
      id: 'ST1LM0002', 
      monumento: 'Vitória', 
      local: 'Avenida Santos Dumont (Canteiro Central, Em Frente Ao Número 1313)' 
    },
    { 
      id: 'ST1LM0003', 
      monumento: '14 Bis', 
      local: 'Praça Campo De Bagatelle' 
    },
    { 
      id: 'ST1LM0004', 
      monumento: 'Monumento Aos Heróis Da FEB', 
      local: 'Praça Heróis Da Força Expedicionária Brasileira' 
    },
    { 
      id: 'ST1LM0005', 
      monumento: 'Nossa Senhora Auxiliadora', 
      local: 'Praça Domingos Correia Da Cruz' 
    }
  ]
};

export default function NovoMonumentosPage() {
  const [assunto, setAssunto] = useState("Limpeza e Conservação de Monumentos Públicos");
  const [data, setData] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [setorSelecionado, setSetorSelecionado] = useState<string>("");
  const [monumento, setMonumento] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fichaFotoUrl, setFichaFotoUrl] = useState("");
  const [fotos, setFotos] = useState<{ antes: string; durante: string; depois: string }>({
    antes: "",
    durante: "",
    depois: ""
  });

  function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Preservar altura (georeferência) - só redimensionar largura se exceder
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob!));
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFileUpload(file: File, callback: (url: string) => void) {
    compressImage(file, 800, 0.8).then(callback);
  }

  function updateFoto(etapa: 'antes' | 'durante' | 'depois', url: string) {
    setFotos(prev => ({ ...prev, [etapa]: url }));
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

  function handleSetorChange(setorId: string) {
    setSetorSelecionado(setorId);
    const monumentoData = MONUMENTOS_DATA[sub as keyof typeof MONUMENTOS_DATA]?.find(m => m.id === setorId);
    if (monumentoData) {
      setMonumento(monumentoData.monumento);
      setLocal(monumentoData.local);
    }
  }

  async function save() {
    // Validações obrigatórias
    if (!data) {
      toast.error("Por favor, selecione a data do serviço.");
      return;
    }

    if (!setorSelecionado) {
      toast.error("Por favor, selecione um setor.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    const fotosArray = [
      ...(fotos.antes ? [{ url: fotos.antes, etapa: "ANTES" as const, descricao: "Antes", ordem: 1 }] : []),
      ...(fotos.durante ? [{ url: fotos.durante, etapa: "DURANTE" as const, descricao: "Durante", ordem: 2 }] : []),
      ...(fotos.depois ? [{ url: fotos.depois, etapa: "DEPOIS" as const, descricao: "Depois", ordem: 3 }] : []),
    ];
    
    // Converter data para formato ISO
    const dataISO = data.toISOString().split('T')[0];
    
    const rel: MonumentosRelatorio = {
      id,
      tipoServico: "MONUMENTOS",
      assunto,
      data: dataISO,
      sub,
      setorSelecionado,
      monumento,
      local,
      descricao,
      fichaFotoUrl,
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Novo Relatório - Monumentos
          </h1>
          <button
            onClick={save}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            Salvar Relatório
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Informações Básicas
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={data ? data.toISOString().split('T')[0] : ''}
                  onChange={(e) => setData(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sub-região
                </label>
                <select
                  value={sub}
                  onChange={(e) => {
                    setSub(e.target.value as SubRegiao);
                    setSetorSelecionado("");
                    setMonumento("");
                    setLocal("");
                  }}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                >
                  <option value="CV">Casa Verde / Limão / Cachoeirinha</option>
                  <option value="JT">Jaçanã / Tremembé</option>
                  <option value="MG">Vila Maria / Vila Guilherme</option>
                  <option value="ST">Santana / Tucuruvi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Setor
                </label>
                <select
                  value={setorSelecionado}
                  onChange={(e) => handleSetorChange(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                  disabled={!sub}
                >
                  <option value="">Selecione um setor</option>
                  {MONUMENTOS_DATA[sub as keyof typeof MONUMENTOS_DATA]?.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Monumento
                </label>
                <input
                  type="text"
                  value={monumento}
                  onChange={(e) => setMonumento(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                  placeholder="Será preenchido automaticamente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Local Atendido
                </label>
                <input
                  type="text"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                  placeholder="Será preenchido automaticamente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                  placeholder="Descrição do serviço executado"
                />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Fotos
            </h2>
            
            <div className="space-y-4">
              {/* Foto da Ficha */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Foto da Ficha (Opcional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, setFichaFotoUrl);
                      }
                    }}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
                  />
                  {fichaFotoUrl && (
                    <div className="relative">
                      <img
                        src={fichaFotoUrl}
                        alt="Foto da Ficha"
                        className="w-full h-40 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                      />
                      <button
                        onClick={() => setFichaFotoUrl("")}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Fotos Fotográficas */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium">Fotos dos Monumentos</h2>
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
                      id="multiple-monumentos"
                    />
                    <label 
                      htmlFor="multiple-monumentos"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs cursor-pointer transition-colors"
                    >
                      📸 Upload múltiplo
                    </label>
                  </div>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                  💡 Dica: Use "Upload múltiplo" para adicionar 1, 2 ou 3 fotos de uma vez (antes/durante/depois)
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
                          id={`monumentos-${etapa}`}
                        />
                        <label 
                          htmlFor={`monumentos-${etapa}`}
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
                            alt={`Monumentos - ${etapa}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
