"use client";
import { useState } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from 'react-toastify';

interface Evento {
  id: string;
  nome: string;
  subRegiao: string;
  tipo: 'predefinido' | 'outros';
}

const EVENTOS_PREDEFINIDOS = {
  ST: [
    'Praça Herois da Forca Expedicionaria Brasileira / Operação Baixas Temperaturas',
    'Praça Herois da Forca Expedicionaria Brasileira / Operação Altas Temperaturas'
  ],
  MG: [
    'Praça Novo Mundo / Operação Baixas Temperaturas',
    'Praça Novo Mundo / Operação Altas Temperaturas'
  ]
};

export default function CadastroEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    subRegiao: 'ST',
    tipo: 'predefinido' as 'predefinido' | 'outros'
  });
  const [eventoPredefinido, setEventoPredefinido] = useState('');
  const [eventoCustomizado, setEventoCustomizado] = useState('');

  const handleAdicionarEvento = () => {
    if (!novoEvento.nome.trim()) {
      toast.error("Por favor, preencha o nome do evento.");
      return;
    }

    const evento: Evento = {
      id: Date.now().toString(),
      nome: novoEvento.nome,
      subRegiao: novoEvento.subRegiao,
      tipo: novoEvento.tipo
    };

    setEventos([...eventos, evento]);
    
    // Limpar formulário
    setNovoEvento({
      nome: '',
      subRegiao: 'ST',
      tipo: 'predefinido'
    });
    setEventoPredefinido('');
    setEventoCustomizado('');
    
    toast.success("Evento adicionado com sucesso!");
  };

  const handleRemoverEvento = (id: string) => {
    setEventos(eventos.filter(e => e.id !== id));
    toast.success("Evento removido com sucesso!");
  };

  const handleTipoChange = (tipo: 'predefinido' | 'outros') => {
    setNovoEvento({ ...novoEvento, tipo });
    if (tipo === 'predefinido') {
      setNovoEvento({ ...novoEvento, tipo, nome: eventoPredefinido });
    } else {
      setNovoEvento({ ...novoEvento, tipo, nome: eventoCustomizado });
    }
  };

  const handlePredefinidoChange = (evento: string) => {
    setEventoPredefinido(evento);
    setNovoEvento({ ...novoEvento, nome: evento });
  };

  const handleCustomizadoChange = (evento: string) => {
    setEventoCustomizado(evento);
    setNovoEvento({ ...novoEvento, nome: evento });
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Cadastro de Eventos
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Gerencie os eventos disponíveis para relatórios
            </p>
          </div>

          {/* Formulário de Novo Evento */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Adicionar Novo Evento
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sub-região
                </label>
                <select
                  value={novoEvento.subRegiao}
                  onChange={(e) => setNovoEvento({ ...novoEvento, subRegiao: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ST">Santana / Tucuruvi</option>
                  <option value="MG">Vila Maria / Vila Guilherme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tipo de Evento
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="predefinido"
                      checked={novoEvento.tipo === 'predefinido'}
                      onChange={() => handleTipoChange('predefinido')}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">Evento Predefinido</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="outros"
                      checked={novoEvento.tipo === 'outros'}
                      onChange={() => handleTipoChange('outros')}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">Outros Eventos</span>
                  </label>
                </div>
              </div>

              {novoEvento.tipo === 'predefinido' ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Evento Predefinido
                  </label>
                  <select
                    value={eventoPredefinido}
                    onChange={(e) => handlePredefinidoChange(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione um evento</option>
                    {EVENTOS_PREDEFINIDOS[novoEvento.subRegiao as keyof typeof EVENTOS_PREDEFINIDOS]?.map((evento) => (
                      <option key={evento} value={evento}>
                        {evento}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    value={eventoCustomizado}
                    onChange={(e) => handleCustomizadoChange(e.target.value)}
                    placeholder="Digite o nome do evento"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={handleAdicionarEvento}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                Adicionar Evento
              </button>
            </div>
          </div>

          {/* Lista de Eventos */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Eventos Cadastrados ({eventos.length})
            </h2>
            
            {eventos.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                Nenhum evento cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {evento.nome}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        Sub-região: {evento.subRegiao} | Tipo: {evento.tipo === 'predefinido' ? 'Predefinido' : 'Outros'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoverEvento(evento.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
