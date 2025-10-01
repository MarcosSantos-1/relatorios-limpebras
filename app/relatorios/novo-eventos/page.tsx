"use client";
import { useState } from "react";
import { upsertReport, clearOldReports } from "@/lib/storage";
import { EventosRelatorio, SubRegiao } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

const EVENTOS_PREDEFINIDOS = {
  ST: [
    'Praça Herois da Forca Expedicionaria Brasileira / Operação Baixas Temperaturas',
    'Praça Herois da Forca Expedicionaria Brasileira / Operação Altas Temperaturas'
  ],
  MG: [
    'Praça Novo Mundo / Operação Baixas Temperaturas',
    'Praça Novo Mundo / Operação Altas Temperaturas'
  ],
  SP: [],
  CV: [],
  JT: []
};

interface DiaEvento {
  data: string;
  fotos: string[];
}

export default function NovoEventosPage() {
  const [assunto] = useState("Eventos");
  const [sub, setSub] = useState<SubRegiao>("ST");
  const [eventoSelecionado, setEventoSelecionado] = useState<string>("");
  const [eventoCustomizado, setEventoCustomizado] = useState<string>("");
  const [tipoEvento, setTipoEvento] = useState<'predefinido' | 'outros'>('predefinido');
  const [diasEventos, setDiasEventos] = useState<DiaEvento[]>([]);
  const [saving, setSaving] = useState(false);

  function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
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

  const adicionarData = () => {
    const novaData: DiaEvento = {
      data: '',
      fotos: []
    };
    setDiasEventos([...diasEventos, novaData]);
  };

  const removerData = (index: number) => {
    setDiasEventos(diasEventos.filter((_, i) => i !== index));
  };

  const atualizarData = (index: number, data: string) => {
    const novosDias = [...diasEventos];
    novosDias[index].data = data;
    setDiasEventos(novosDias);
  };

  const addFotoDia = (diaIndex: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => {
          handleFileUpload(file, (url) => {
            const novosDias = [...diasEventos];
            novosDias[diaIndex].fotos.push(url);
            setDiasEventos(novosDias);
          });
        });
      }
    };
    
    input.click();
  };

  const removeFotoDia = (diaIndex: number, fotoIndex: number) => {
    const novosDias = [...diasEventos];
    novosDias[diaIndex].fotos.splice(fotoIndex, 1);
    setDiasEventos(novosDias);
  };

  const getNomeEvento = () => {
    if (tipoEvento === 'predefinido') {
      return eventoSelecionado;
    } else {
      return eventoCustomizado;
    }
  };

  async function save() {
    if (diasEventos.length === 0) {
      toast.error("Por favor, adicione pelo menos uma data.");
      return;
    }

    const nomeEvento = getNomeEvento();
    if (!nomeEvento.trim()) {
      toast.error("Por favor, selecione ou digite o nome do evento.");
      return;
    }

    // Verificar se todas as datas têm data selecionada e fotos
    const diasInvalidos = diasEventos.filter(dia => !dia.data || dia.fotos.length === 0);
    if (diasInvalidos.length > 0) {
      toast.error("Todas as datas devem ter uma data selecionada e pelo menos uma foto.");
      return;
    }

    setSaving(true);

    try {
      const now = Date.now();
      
      // Criar um relatório para cada dia
      for (const diaEvento of diasEventos) {
        const id = uuidv4();
        
        const rel: EventosRelatorio = {
          id,
          tipoServico: "EVENTOS",
          assunto,
          dataInicio: diaEvento.data,
          dataFim: diaEvento.data,
          sub,
          local: nomeEvento.split(' / ')[0] || nomeEvento,
          descricao: "Evento",
          nomeEvento,
          fotos: diaEvento.fotos.map(url => ({ url, descricao: nomeEvento })),
          createdAt: now,
          updatedAt: now,
        };
        
        await upsertReport(rel);
      }
      
      toast.success(`${diasEventos.length} relatório(s) de evento criado(s) com sucesso!`);
      window.location.href = `/relatorios`;
    } catch (error) {
      console.error("Erro ao salvar relatórios:", error);
      toast.error("Erro ao salvar. Tentando limpar relatórios antigos...");
      await clearOldReports();
      try {
        // Tentar novamente
        for (const diaEvento of diasEventos) {
          const id = uuidv4();
          
          const rel: EventosRelatorio = {
            id,
            tipoServico: "EVENTOS",
            assunto,
            dataInicio: diaEvento.data,
            dataFim: diaEvento.data,
            sub,
            local: nomeEvento.split(' / ')[0] || nomeEvento,
            descricao: "Evento",
            nomeEvento,
            fotos: diaEvento.fotos.map(url => ({ url, descricao: nomeEvento })),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          await upsertReport(rel);
        }
        toast.success("Relatórios salvos com sucesso após limpeza!");
        window.location.href = `/relatorios`;
      } catch (retryError) {
        toast.error("Erro persistente. Por favor, tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Novo Relatório - Eventos
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Cadastre eventos com fotos por data
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Dados do Evento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sub-região *
                </label>
                <select
                  value={sub}
                  onChange={(e) => {
                    setSub(e.target.value as SubRegiao);
                    setEventoSelecionado('');
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ST">Santana / Tucuruvi</option>
                  <option value="MG">Vila Maria / Vila Guilherme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tipo de Evento *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoEvento"
                      value="predefinido"
                      checked={tipoEvento === 'predefinido'}
                      onChange={() => setTipoEvento('predefinido')}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">Evento Predefinido</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoEvento"
                      value="outros"
                      checked={tipoEvento === 'outros'}
                      onChange={() => setTipoEvento('outros')}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">Outros Eventos</span>
                  </label>
                </div>
              </div>
            </div>

            {tipoEvento === 'predefinido' ? (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Evento Predefinido *
                </label>
                <select
                  value={eventoSelecionado}
                  onChange={(e) => setEventoSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione um evento</option>
                  {EVENTOS_PREDEFINIDOS[sub]?.map((evento: string) => (
                    <option key={evento} value={evento}>
                      {evento}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome do Evento *
                </label>
                <input
                  type="text"
                  value={eventoCustomizado}
                  onChange={(e) => setEventoCustomizado(e.target.value)}
                  placeholder="Digite o nome do evento"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Seção de Datas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Datas do Evento ({diasEventos.length})
                </h3>
                <button
                  onClick={adicionarData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ➕ Adicionar Data
                </button>
              </div>

              {diasEventos.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  Nenhuma data adicionada ainda. Clique em "Adicionar Data" para começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {diasEventos.map((diaEvento, index) => (
                    <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                          Data {index + 1}
                        </h4>
                        <button
                          onClick={() => removerData(index)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Data *
                          </label>
                          <input
                            type="date"
                            value={diaEvento.data}
                            onChange={(e) => atualizarData(index, e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={() => addFotoDia(index)}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            📸 Adicionar Fotos
                          </button>
                        </div>
                      </div>
                      
                      {diaEvento.fotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {diaEvento.fotos.map((foto, fotoIndex) => (
                            <div key={fotoIndex} className="relative">
                              <img
                                src={foto}
                                alt={`Foto ${fotoIndex + 1}`}
                                className="w-full h-24 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                              />
                              <button
                                onClick={() => removeFotoDia(index, fotoIndex)}
                                className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                          Nenhuma foto adicionada para esta data
                        </div>
                      )}
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
                {saving ? "Salvando..." : `Salvar ${diasEventos.length} Relatório(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}