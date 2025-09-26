"use client";
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Acumulador, StatusAcumulador, SUB_REGIOES } from '@/lib/types';
import { CustomDatePicker } from '@/components/CustomDatePicker';

interface AcumuladorFormProps {
  acumulador?: Acumulador;
  onSave: (acumulador: Omit<Acumulador, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function AcumuladorForm({ acumulador, onSave, onCancel }: AcumuladorFormProps) {
  const [formData, setFormData] = useState({
    sub: acumulador?.sub || 'SP' as keyof typeof SUB_REGIOES,
    dia: acumulador?.dia ? new Date(acumulador.dia) : new Date(),
    hora: acumulador?.hora || '08:00',
    endereco: acumulador?.endereco || '',
    sei: acumulador?.sei || '',
    placaVeiculo: acumulador?.placaVeiculo || '',
    status: acumulador?.status || 'nao_comecou' as StatusAcumulador,
    observacoes: acumulador?.observacoes || '',
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
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        {acumulador ? 'Editar Acumulador' : 'Novo Acumulador'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Sub-região
            </label>
            <select
              name="sub"
              value={formData.sub}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="nao_comecou">Não começou</option>
              <option value="aguardando_descarga">Aguardando descarga do veículo</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SEI (ID do acumulador)
            </label>
            <input
              type="text"
              name="sei"
              value={formData.sei}
              onChange={handleChange}
              placeholder="Número ID do acumulador na prefeitura"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placa do Veículo <span className="text-gray-500 dark:text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              name="placaVeiculo"
              value={formData.placaVeiculo}
              onChange={handleChange}
              placeholder="ABC-1234"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
            placeholder="Observações adicionais..."
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
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-lg"
          >
            {acumulador ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
