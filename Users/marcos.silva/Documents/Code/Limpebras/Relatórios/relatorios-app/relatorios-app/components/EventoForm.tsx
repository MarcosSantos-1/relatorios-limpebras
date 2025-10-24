"use client";
import { useState } from 'react';
import { format } from 'date-fns';
import { Evento, SUB_REGIOES } from '@/lib/types';
import { CustomDatePicker } from '@/components/CustomDatePicker';

interface EventoFormProps {
  evento?: Evento;
  onSave: (evento: Omit<Evento, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function EventoForm({ evento, onSave, onCancel }: EventoFormProps) {
  const [formData, setFormData] = useState({
    nome: evento?.nome || '',
    sub: evento?.sub || 'SP' as keyof typeof SUB_REGIOES,
    dia: evento?.dia ? new Date(evento.dia) : new Date(),
    hora: evento?.hora || '08:00',
    endereco: evento?.endereco || '',
    tipo: evento?.tipo || 'evento' as 'evento' | 'reuniao' | 'outros',
    descricao: evento?.descricao || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dia: format(formData.dia, 'yyyy-MM-dd'),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {evento ? 'Editar Evento' : 'Novo Evento'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Evento
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome do evento"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="evento">Evento</option>
              <option value="reuniao">Reunião</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sub-região
            </label>
            <select
              name="sub"
              value={formData.sub}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            >
              {Object.entries(SUB_REGIOES).map(([key, value]) => (
                <option key={key} value={key}>
                  {key} - {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Data
            </label>
            <CustomDatePicker
              selectedDate={formData.dia}
              onChange={(date) => setFormData(prev => ({ ...prev, dia: date || new Date() }))}
              placeholder="Selecione uma data"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora
            </label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Endereço
          </label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Endereço completo"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows={3}
            placeholder="Descrição do evento..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {evento ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
