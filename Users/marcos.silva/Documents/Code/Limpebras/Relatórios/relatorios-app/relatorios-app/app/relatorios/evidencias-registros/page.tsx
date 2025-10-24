"use client";
import Link from "next/link";
import { useState } from "react";
import { CustomDatePicker } from "@/components/CustomDatePicker";

export default function EvidenciasRegistrosPage() {
  const [dataFiltro, setDataFiltro] = useState<string>("");
  const [dataFiltroDate, setDataFiltroDate] = useState<Date | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold flex-1">Evidências - Registros</h1>
        <Link href="/relatorios" className="text-zinc-600 dark:text-zinc-300 hover:underline">Voltar</Link>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-black dark:text-zinc-400 font-bold mb-1">Data</label>
            <CustomDatePicker
              selectedDate={dataFiltroDate}
              onChange={setDataFiltroDate}
              placeholder="Selecione uma data"
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col justify-end">
            <button
              disabled
              className="px-4 py-2 rounded text-white bg-gray-400 cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gerar PDF (Em Desenvolvimento)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Em Desenvolvimento</h2>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm">
          Esta funcionalidade será implementada futuramente para gerar relatórios consolidados de Registros.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-2">
          Funcionalidade planejada: relatórios com múltiplos registros por data, 
          organização automática por sub-região e tipo de serviço.
        </p>
      </div>

      <div className="bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded p-4">
        <h3 className="text-blue-800 dark:text-blue-200 font-semibold">📋 Funcionalidades Planejadas</h3>
        <ul className="text-blue-700 dark:text-blue-300 text-sm mt-2 space-y-1">
          <li>• Filtros por data e tipo de serviço</li>
          <li>• Consolidação de múltiplos registros</li>
          <li>• Organização por sub-região</li>
          <li>• Geração de PDF consolidado</li>
          <li>• Seção fotográfica organizada</li>
        </ul>
      </div>
    </div>
  );
}

