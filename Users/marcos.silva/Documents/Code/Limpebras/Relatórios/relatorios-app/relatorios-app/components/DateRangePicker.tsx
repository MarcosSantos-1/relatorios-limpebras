"use client";
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = "Selecione o período",
  className = ""
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onStartDateChange(start);
    onEndDateChange(end);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return startDate.toLocaleDateString('pt-BR');
    if (!startDate && endDate) return endDate.toLocaleDateString('pt-BR');
    if (startDate && endDate) {
      if (startDate.getTime() === endDate.getTime()) {
        return startDate.toLocaleDateString('pt-BR');
      }
      return `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`;
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 rounded border border-zinc-700 text-left flex items-center justify-between"
      >
        <span className={startDate || endDate ? "text-zinc-100" : "text-zinc-400"}>
          {formatDateRange()}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 p-4">
          <DatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            dateFormat="dd/MM/yyyy"
          />
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                onStartDateChange(null);
                onEndDateChange(null);
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
      )}
    </div>
  );
}
