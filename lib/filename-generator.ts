import { Relatorio, SUB_REGIOES } from './types';

/**
 * Gera nome personalizado do arquivo baseado no tipo de relatório
 */
export function generateFileName(relatorio: Relatorio): string {
  // Obter a data do relatório
  let reportDate: Date;
  
  if (relatorio.tipoServico === 'MUTIRAO' && 'data' in relatorio) {
    reportDate = new Date(relatorio.data + 'T00:00:00'); // Evita problema de timezone
  } else if (relatorio.tipoServico === 'ACUMULADOR' || 
             relatorio.tipoServico === 'ALAGAMENTOS' || relatorio.tipoServico === 'ZELADORIA') {
    reportDate = new Date((relatorio as { dataInicio: string }).dataInicio + 'T00:00:00'); // Evita problema de timezone
  } else if (relatorio.tipoServico === 'REVITALIZACAO' && 'data' in relatorio) {
    reportDate = new Date(relatorio.data + 'T00:00:00'); // Evita problema de timezone
  } else if (relatorio.tipoServico === 'HIGIENIZACAO' && 'data' in relatorio) {
    reportDate = new Date(relatorio.data + 'T00:00:00'); // Evita problema de timezone
  } else if (relatorio.tipoServico === 'VARRICAO_MECANIZADA' && 'data' in relatorio) {
    reportDate = new Date(relatorio.data + 'T00:00:00'); // Evita problema de timezone
  } else if (relatorio.tipoServico === 'FEIRAS' && 'data' in relatorio) {
    reportDate = new Date(relatorio.data + 'T00:00:00'); // Evita problema de timezone
  } else if (relatorio.tipoServico === 'ROTINEIROS' && 'data' in relatorio) {
    reportDate = new Date(relatorio.data + 'T00:00:00'); // Evita problema de timezone
  } else {
    reportDate = new Date();
  }
  
  const dateStr = reportDate.toLocaleDateString('pt-BR').replace(/\//g, '.');
  
  switch (relatorio.tipoServico) {
    case 'MUTIRAO':
      // Para multirão será (por sub): Relatório Operação SP Limpa {CV} - {13.09.2025} - Limpebras
      if ('secoes' in relatorio && relatorio.secoes.length > 0) {
        const sub = relatorio.secoes[0].sub;
        return `Relatório Operação SP Limpa ${sub} - ${dateStr} - Limpebras`;
      }
      return `Relatório Operação SP Limpa - ${dateStr} - Limpebras`;
      
    case 'ACUMULADOR':
      // Para Acumulador será: Relatório Ação de Acumulador {ST} - {12.09.2025} - Limpebras
      if ('sub' in relatorio) {
        return `Relatório Ação de Acumulador ${relatorio.sub} - ${dateStr} - Limpebras`;
      }
      return `Relatório Ação de Acumulador - ${dateStr} - Limpebras`;
      
    case 'ZELADORIA':
    case 'REVITALIZACAO':
    case 'HIGIENIZACAO':
    case 'VARRICAO_MECANIZADA':
    case 'FEIRAS':
    case 'ROTINEIROS':
      // Para os demais serão: Relatório Fotográfico - {12.09.2025} - Limpebras
      return `Relatório Fotográfico - ${dateStr} - Limpebras`;
      
    case 'ALAGAMENTOS':
      // Para Alagamentos será: Relatório Pós Alagamentos {ST} - {12.09.2025} - Limpebras
      if ('sub' in relatorio) {
        return `Relatório Pós Alagamento ${relatorio.sub} - ${dateStr} - Limpebras`;
      }
      return `Relatório Pós Alagamento - ${dateStr} - Limpebras`;
      
    default:
      return `Relatório - ${dateStr} - Limpebras`;
  }
}

/**
 * Gera nome para mutirão consolidado
 */
export function generateConsolidatedFileName(dateFilter?: string): string {
  let reportDate: Date;
  
  if (dateFilter) {
    // Usar a data filtrada, adicionando T00:00:00 para evitar problemas de timezone
    reportDate = new Date(dateFilter + 'T00:00:00');
  } else {
    reportDate = new Date();
  }
  
  const dateStr = reportDate.toLocaleDateString('pt-BR').replace(/\//g, '.');
  return `Relatório Operação SP Limpa - ${dateStr} - Limpebras`;
}

/**
 * Gera nome para revitalizações consolidado
 */
export function generateRevitalizacoesConsolidadoFileName(mesAno: string): string {
  // mesAno vem no formato "Setembro de 2025"
  return `Relatório Revitalizações - ${mesAno} - LimpaSP`;
}

/**
 * Gera nome para serviços rotineiros consolidado
 */
export function generateRotineirosConsolidadoFileName(mesAno: string): string {
  // mesAno vem no formato "Setembro de 2025"
  return `Relatorio Servicos Rotineiros - ${mesAno} - LimpaSP`;
}