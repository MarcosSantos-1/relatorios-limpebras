"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RotineirosRelatorio, SubRegiao, ECOPONTOS_POR_SUBREGIAO } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

export default function NovoEcopontosPage() {
  const [assunto] = useState("Serviços Rotineiros");
  const [data, setData] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("CV");
  const [ecopontoSelecionado, setEcopontoSelecionado] = useState<string>("");
  const [fotos, setFotos] = useState<string[]>([]);

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
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFileUpload(file: File, callback: (url: string) => void) {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    compressImage(file).then(callback);
  }

  function addFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const currentFotos = fotos;
        
        // Verificar limite de fotos (máximo 10)
        if (currentFotos.length + fileArray.length > 10) {
          toast.error(`Máximo de 10 fotos. Você já tem ${currentFotos.length} foto(s).`);
          return;
        }

        fileArray.forEach((file, index) => {
          handleFileUpload(file, (url) => {
            setFotos(prev => [...prev, url]);
          });
        });
      }
    };
    input.click();
  }

  function removeFoto(index: number) {
    setFotos(prev => prev.filter((_, i) => i !== index));
  }

  async function save() {
    // Validações obrigatórias
    if (!data) {
      toast.error("Por favor, selecione a data do serviço.");
      return;
    }

    if (!ecopontoSelecionado) {
      toast.error("Por favor, selecione um ecoponto.");
      return;
    }

    if (fotos.length === 0) {
      toast.error("Por favor, adicione pelo menos uma foto.");
      return;
    }

    const now = Date.now();
    const id = uuidv4();
    
    // Converter data para formato ISO
    const dataISO = data.toISOString().split('T')[0];
    
    // Criar serviço com fotos
    const servicos = [{
      assunto: ecopontoSelecionado,
      fotos: fotos.map(url => ({ url, descricao: ecopontoSelecionado })),
      observacao: ""
    }];
    
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
      }
    }
  }

  const ecopontosDisponiveis = ECOPONTOS_POR_SUBREGIAO[sub as keyof typeof ECOPONTOS_POR_SUBREGIAO] || [];

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">🏭 Cadastro de Ecopontos</h1>
                <p className="text-green-100">Registre serviços realizados nos ecopontos</p>
              </div>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Dados do Serviço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Data do Serviço *
                </label>
                <input
                  type="date"
                  value={data ? data.toISOString().split('T')[0] : ''}
                  onChange={(e) => setData(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sub-região *
                </label>
                <select
                  value={sub}
                  onChange={(e) => {
                    setSub(e.target.value as SubRegiao);
                    setEcopontoSelecionado(""); // Reset ecoponto quando mudar sub-região
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="CV">Casa Verde / Limão / Cachoeirinha</option>
                  <option value="JT">Jaçanã / Tremembé</option>
                  <option value="MG">Vila Maria / Vila Guilherme</option>
                  <option value="ST">Santana / Tucuruvi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Ecoponto *
              </label>
              <select
                value={ecopontoSelecionado}
                onChange={(e) => setEcopontoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={false}
              >
                <option value="">Selecione um ecoponto</option>
                {ecopontosDisponiveis.map((ecoponto) => (
                  <option key={ecoponto} value={ecoponto}>
                    {ecoponto}
                  </option>
                ))}
              </select>
              {false && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Selecione uma sub-região para ver os ecopontos disponíveis
                </p>
              )}
            </div>
          </div>

          {/* Fotos */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Fotos do Ecoponto
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {fotos.length}/10 fotos
                </span>
                <button
                  onClick={addFoto}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar Fotos
                </button>
              </div>
            </div>

            {fotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={foto}
                      alt={`Ecoponto - Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-zinc-300 dark:border-zinc-600"
                    />
                    <button
                      onClick={() => removeFoto(index)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
                      {ecopontoSelecionado || `Foto ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fotos.length === 0 && (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Nenhuma foto adicionada ainda</p>
                <p className="text-sm">Clique em "Adicionar Fotos" para começar</p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button 
              onClick={save}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvar Relatório
            </button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
