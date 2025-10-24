// Funções utilitárias para formatação e manipulação de dados

import { Relatorio } from "./types";

/**
 * Converte data do formato ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  
  // Se já está no formato DD/MM/YYYY, retorna como está
  if (dateStr.includes('/')) {
    return dateStr;
  }
  
  // Se é uma data ISO com horário, extrair apenas a parte da data
  let datePart = dateStr;
  if (dateStr.includes('T')) {
    datePart = dateStr.split('T')[0];
  }
  
  // Converte de YYYY-MM-DD para DD/MM/YYYY
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  
  return dateStr;
}

/**
 * Formata data com dia da semana no formato brasileiro (SEG - 15/09/2025)
 */
export function formatDateWithWeekday(dateStr: string): string {
  if (!dateStr) return "";
  
  // Se é uma data ISO com horário, extrair apenas a parte da data
  let datePart = dateStr;
  if (dateStr.includes('T')) {
    datePart = dateStr.split('T')[0];
  }
  
  // Converter para objeto Date
  const date = new Date(datePart + 'T00:00:00');
  
  // Dias da semana em português
  const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const weekday = weekdays[date.getDay()];
  
  // Formatar data no padrão DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${weekday} - ${day}/${month}/${year}`;
}

/**
 * Converte data do formato brasileiro (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
 */
export function formatDateISO(dateStr: string): string {
  if (!dateStr) return "";
  
  // Se já está no formato YYYY-MM-DD, retorna como está
  if (dateStr.includes('-')) {
    return dateStr;
  }
  
  // Converte de DD/MM/YYYY para YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

/**
 * Formata data para exibição na capa dos relatórios (ex: "São Paulo, Setembro de 2025")
 */
export function formatDateForCover(dateStr: string): string {
  if (!dateStr) return "";
  
  let day: number, month: number, year: number;
  
  // Parse da data no formato DD/MM/YYYY ou YYYY-MM-DD
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
    year = parseInt(parts[2]);
  } else {
    const parts = dateStr.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);
  }
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  return `São Paulo, ${day} de ${monthNames[month - 1]} de ${year}`;
}

/**
 * Formata data para exibição nos fotográficos (ex: "20/09/2025")
 */
export function formatDateForPhotos(dateStr: string): string {
  if (!dateStr) return "";
  
  let day: number, month: number, year: number;
  
  // Parse da data no formato DD/MM/YYYY ou YYYY-MM-DD
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
    year = parseInt(parts[2]);
  } else {
    const parts = dateStr.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);
  }
  
  // Formatar com zeros à esquerda se necessário
  const dayStr = day.toString().padStart(2, '0');
  const monthStr = month.toString().padStart(2, '0');
  
  return `${dayStr}/${monthStr}/${year}`;
}

/**
 * Formata período para exibição nos fotográficos (ex: "20/09/2025 a 21/09/2025")
 */
export function formatPeriodForPhotos(dataInicio: string, dataTermino?: string): string {
  const inicioFormatado = formatDateForPhotos(dataInicio);
  
  if (!dataTermino || dataInicio === dataTermino) {
    return inicioFormatado;
  }
  
  const terminoFormatado = formatDateForPhotos(dataTermino);
  return `${inicioFormatado} a ${terminoFormatado}`;
}

/**
 * Formata período para página de serviço (ex: "São Paulo, 18 de Setembro de 2025" ou "Período: 18.09.2025 a 19.09.2025")
 */
export function formatPeriodForServicePage(relatorio: Relatorio): string {
  if (relatorio.tipoServico === 'MUTIRAO' && 'data' in relatorio) {
    // Para mutirão, usar formato "São Paulo, 18 de Setembro de 2025"
    return formatDateForCover(relatorio.data);
  } else if ('dataInicio' in relatorio && 'dataTermino' in relatorio) {
    // Para outros serviços com período
    const inicioFormatado = formatDateForPhotos(relatorio.dataInicio || '');
    
    if (!relatorio.dataTermino || relatorio.dataInicio === relatorio.dataTermino) {
      return `Data: ${inicioFormatado}`;
    }
    
    const terminoFormatado = formatDateForPhotos(relatorio.dataTermino);
    return `Período: ${inicioFormatado} a ${terminoFormatado}`;
  } else if ('data' in relatorio) {
    // Para revitalização (data única)
    return `Data: ${formatDateForPhotos(relatorio.data)}`;
  }
  
  return "";
}

