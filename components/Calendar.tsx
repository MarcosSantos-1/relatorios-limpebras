"use client";
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isToday, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Acumulador, Evento, FechamentoEvento, SUB_REGIOES } from '@/lib/types';

interface CalendarProps {
  acumuladores?: Acumulador[];
  eventos?: Evento[];
  fechamentos?: FechamentoEvento[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({ 
  acumuladores = [], 
  eventos = [], 
  fechamentos = [], 
  onDateClick = () => {}, 
  selectedDate 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Feriados nacionais e de SP
  const getHolidays = (year: number) => {
    return [
      { date: new Date(year, 0, 1), name: 'Confraternização Universal' },
      { date: new Date(year, 3, 21), name: 'Tiradentes' },
      { date: new Date(year, 4, 1), name: 'Dia do Trabalhador' },
      { date: new Date(year, 8, 7), name: 'Independência do Brasil' },
      { date: new Date(year, 9, 12), name: 'Nossa Senhora Aparecida' },
      { date: new Date(year, 10, 2), name: 'Finados' },
      { date: new Date(year, 10, 15), name: 'Proclamação da República' },
      { date: new Date(year, 11, 25), name: 'Natal' },
      // Feriados de SP
      { date: new Date(year, 0, 25), name: 'Aniversário de SP' },
      { date: new Date(year, 10, 20), name: 'Consciência Negra' },
    ];
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfMonth(monthStart);
  const endDate = endOfMonth(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const startDateOfWeek = getDay(startDate);

  // Função para converter data sem problemas de fuso horário
  const parseDate = (dateString: string | Date) => {
    // Se a data já é um objeto Date, retorna ela
    if (dateString instanceof Date) return dateString;
    
    // Se é uma string, cria uma nova data local
    const date = new Date(dateString);
    // Ajusta para o fuso horário local
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  };

  // Função para obter eventos de um dia específico
  const getEventsForDay = (date: Date) => {
    const dayEvents = (eventos || []).filter(evento => isSameDay(parseDate(evento.dia), date));
    const dayAcumuladores = (acumuladores || []).filter(acumulador => isSameDay(parseDate(acumulador.dia), date));
    const dayFechamentos = (fechamentos || []).filter(fechamento => isSameDay(parseDate(fechamento.data), date));
    const holidays = getHolidays(date.getFullYear()).filter(holiday => isSameDay(holiday.date, date));
    
    return {
      eventos: dayEvents,
      acumuladores: dayAcumuladores,
      fechamentos: dayFechamentos,
      holidays: holidays,
    };
  };

  // Função para obter o primeiro dia útil do mês
  const getFirstBusinessDay = (year: number, month: number) => {
    const holidays = getHolidays(year);
    let day = 1;
    
    while (true) {
      const testDate = new Date(year, month, day);
      const isHoliday = holidays.some(holiday => isSameDay(holiday.date, testDate));
      
      if (!isWeekend(testDate) && !isHoliday) {
        return testDate;
      }
      day++;
      
      // Evitar loop infinito
      if (day > 31) break;
    }
    
    return new Date(year, month, 1);
  };

  // Adicionar eventos de fechamento automáticos se não existirem
  useEffect(() => {
    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth() + 1;
    
    const existingFechamento = (fechamentos || []).find(f => f.ano === currentYear && f.mes === currentMonthNum);
    
    if (!existingFechamento) {
      const firstBusinessDay = getFirstBusinessDay(currentYear, currentMonthNum - 1);
      // Aqui você pode adicionar automaticamente o fechamento se quiser
    }
  }, [currentMonth, fechamentos]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizado': return 'bg-green-500';
      case 'aguardando_descarga': return 'bg-yellow-500';
      case 'cancelado': return 'bg-red-500';
      case 'nao_comecou': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'evento': return 'bg-blue-500';
      case 'reuniao': return 'bg-purple-500';
      case 'outros': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50 p-6">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espaços vazios no início do mês */}
        {Array.from({ length: startDateOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="h-40"></div>
        ))}
        
        {/* Dias do mês */}
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const dayEvents = getEventsForDay(day);
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`
                h-40 p-2 border border-zinc-200 dark:border-zinc-600 cursor-pointer transition-colors
                ${isCurrentMonth ? 'bg-white dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900'}
                ${isSelected ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'}
                ${isCurrentDay ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}
              `}
            >
              <div className="flex flex-col h-full">
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentMonth ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}
                  ${isCurrentDay ? 'text-purple-600 dark:text-purple-400 font-bold' : ''}
                `}>
                  {format(day, 'd')}
                </div>
                
                <div className="flex-1 space-y-1 overflow-hidden">
                  {/* Feriados */}
                  {dayEvents.holidays.map((holiday, index) => (
                    <div
                      key={`holiday-${index}`}
                      className="w-full bg-orange-500 rounded text-xs text-white p-1"
                      title={holiday.name}
                    >
                      <div className="font-semibold">FERIADO</div>
                      <div className="text-xs opacity-90 truncate">{holiday.name}</div>
                    </div>
                  ))}
                  
                  {/* Eventos de fechamento */}
                  {dayEvents.fechamentos.map(fechamento => (
                    <div
                      key={fechamento.id}
                      className="w-full bg-red-500 rounded text-xs text-white p-1 truncate"
                      title="FECHAMENTO"
                    >
                      FECHAMENTO
                    </div>
                  ))}
                  
                  {/* Acumuladores */}
                  {dayEvents.acumuladores.slice(0, 2).map(acumulador => (
                    <div
                      key={acumulador.id}
                      className={`w-full rounded text-xs text-white p-1 ${getStatusColor(acumulador.status)}`}
                      title={`${SUB_REGIOES[acumulador.sub]} - ${acumulador.hora}`}
                    >
                      <div className="font-semibold">ACUMULADOR</div>
                      <div>{SUB_REGIOES[acumulador.sub]}</div>
                      <div className="text-xs opacity-90">{acumulador.hora}</div>
                    </div>
                  ))}
                  
                  {/* Eventos */}
                  {dayEvents.eventos.slice(0, 2).map(evento => (
                    <div
                      key={evento.id}
                      className={`w-full rounded text-xs text-white p-1 ${getEventTypeColor(evento.tipo)}`}
                      title={`${evento.nome} - ${evento.hora}`}
                    >
                      <div className="font-semibold">{evento.tipo.toUpperCase()}</div>
                      <div className="truncate">{evento.nome}</div>
                      <div className="text-xs opacity-90">{evento.hora}</div>
                    </div>
                  ))}
                  
                  {/* Indicador de mais eventos */}
                  {(dayEvents.acumuladores.length + dayEvents.eventos.length) > 4 && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                      +{(dayEvents.acumuladores.length + dayEvents.eventos.length) - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Feriado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Fechamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Finalizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Aguardando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Reunião</span>
          </div>
        </div>
      </div>
    </div>
  );
}
