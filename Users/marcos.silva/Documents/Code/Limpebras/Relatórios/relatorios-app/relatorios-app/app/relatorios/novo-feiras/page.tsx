"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { RegistroRelatorio, SubRegiao } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

export default function NovoFeirasPage() {
  const [assunto] = useState("Feiras");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [sub, setSub] = useState<SubRegiao>("SP");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
      if (files) {
        Array.from(files).forEach(file => {
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
    if (!dataInicio) {
      toast.error("Por favor, selecione a data de início.");
      return;
    }

    if (!dataFim) {
      toast.error("Por favor, selecione a data de fim.");
      return;
    }

    if (!local.trim()) {
      toast.error("Por favor, informe o local.");
      return;
    }

    if (fotos.length === 0) {
      toast.error("Por favor, adicione pelo menos uma foto.");
      return;
    }

    setSaving(true);

    try {
      const now = Date.now();
      const id = uuidv4();
      
      // Converter datas para formato ISO
      const dataInicioISO = dataInicio.toISOString().split('T')[0];
      const dataFimISO = dataFim.toISOString().split('T')[0];
      
      const rel: RegistroRelatorio = {
        id,
        tipoServico: "FEIRAS",
        assunto,
        dataInicio: dataInicioISO,
        dataTermino: dataFimISO,
        sub,
        local,
        descricao,
        fotos: fotos.map(url => ({ url, descricao: assunto })),
        createdAt: now,
        updatedAt: now,
      };
      
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Novo Relatório - Feiras
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Cadastre um novo relatório de feiras
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Dados do Serviço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={dataInicio ? dataInicio.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDataInicio(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Data de Fim *
                </label>
                <input
                  type="date"
                  value={dataFim ? dataFim.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDataFim(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sub-região *
                </label>
                <select
                  value={sub}
                  onChange={(e) => setSub(e.target.value as SubRegiao)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="SP">São Paulo</option>
                  <option value="CV">Casa Verde / Limão / Cachoeirinha</option>
                  <option value="JT">Jaçanã / Tremembé</option>
                  <option value="MG">Vila Maria / Vila Guilherme</option>
                  <option value="ST">Santana / Tucuruvi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Local *
                </label>
                <input
                  type="text"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Ex: Praça da República"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva os detalhes da feira..."
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Seção de Fotos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Fotos ({fotos.length})
                </h3>
                <button
                  type="button"
                  onClick={addFoto}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Adicionar Fotos
                </button>
              </div>

              {fotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Salvando..." : "Salvar Relatório"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
