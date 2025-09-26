"use client";
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SingleDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function SingleDatePicker({
  selectedDate,
  onChange,
  placeholder = "Selecione a data",
  className = ""
}: SingleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = () => {
    if (!selectedDate) return placeholder;
    return selectedDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 rounded border border-zinc-700 text-left flex items-center justify-between"
      >
        <span className={selectedDate ? "text-zinc-100" : "text-zinc-400"}>
          {formatDate()}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50">
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Data</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    onChange(date);
                    setIsOpen(false);
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="bg-zinc-700 text-zinc-100 px-3 py-2 rounded border border-zinc-600 w-full"
                  placeholderText="Selecione a data"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-300"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
