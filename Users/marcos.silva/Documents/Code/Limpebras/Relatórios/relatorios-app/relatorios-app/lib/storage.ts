import type { Relatorio, ReportSummary } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Função para obter token de autenticação
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Função para fazer requisições autenticadas
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

// Função para atualizar ou criar relatório (upsert)
export async function upsertReport(relatorio: Relatorio): Promise<Relatorio> {
  try {
    // Se tem ID, primeiro tenta buscar o relatório para ver se existe
    if (relatorio.id) {
      try {
        // Tenta buscar o relatório existente
        const existingReport = await getReport(relatorio.id);
        if (existingReport) {
          // Se existe, atualiza
          return await updateReport(relatorio.id, relatorio);
        }
      } catch (error) {
        // Se não encontrou, continua para criar novo
        console.log('Relatório não encontrado, criando novo...');
      }
    }
    
    // Se não tem ID ou não foi encontrado, cria novo
    // Remove o ID para forçar criação de novo
    const newRelatorio = { ...relatorio };
    delete (newRelatorio as any).id;
    
    return await saveReport(newRelatorio);
  } catch (error) {
    console.error('Erro ao fazer upsert do relatório:', error);
    throw error;
  }
}

// Função para limpar relatórios antigos (simulada por enquanto)
export async function clearOldReports(): Promise<void> {
  try {
    // Por enquanto não faz nada, mas pode ser implementada para limpar relatórios antigos
    console.log('Função clearOldReports chamada - não implementada ainda');
  } catch (error) {
    console.error('Erro ao limpar relatórios antigos:', error);
    throw error;
  }
}

// Função para obter informações do storage (simulada por enquanto)
export async function getStorageInfo() {
  return {
    documentCount: 0,
    maxCapacity: 2 * 1024 * 1024 * 1024, // 2GB
    availableCapacity: 2 * 1024 * 1024 * 1024,
    usedCapacity: 0,
    percentage: 0
  };
}

// Função para listar relatórios
export async function listReports(): Promise<ReportSummary[]> {
  try {
    const response = await apiRequest('/relatorios');
    const data = await response.json();
    
    // Converter Relatorio para ReportSummary
    return data.relatorios.map((rel: Relatorio) => ({
      id: rel.id,
      title: rel.title,
      data: rel.data || rel.dataInicio || new Date().toISOString().split('T')[0],
      tipoServico: rel.tipoServico,
      sub: rel.sub,
      local: rel.local,
      endereco: rel.endereco,
      fotoCount: rel.fotos ? rel.fotos.length : 0
    }));
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    // Fallback para array vazio se o backend não estiver disponível
    return [];
  }
}

// Função para deletar relatório
export async function deleteReport(id: string): Promise<void> {
  try {
    await apiRequest(`/relatorios/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Erro ao deletar relatório:', error);
    throw error;
  }
}

// Função para salvar relatório
export async function saveReport(relatorio: Relatorio): Promise<Relatorio> {
  try {
    // Converter dados do frontend para o formato do backend
    const backendData = {
      tipoServico: relatorio.tipoServico,
      title: relatorio.title,
      data: relatorio.data,
      dataInicio: relatorio.dataInicio,
      dataTermino: relatorio.dataTermino,
      sub: relatorio.sub,
      local: relatorio.local,
      endereco: relatorio.endereco,
      descricao: relatorio.descricao,
      assunto: relatorio.assunto,
      frequencia: relatorio.frequencia,
      peso: relatorio.peso,
      quantitativo: relatorio.quantitativo,
      secoes: relatorio.secoes,
      fotos: relatorio.fotos,
      servicos: relatorio.servicos
    };

    const response = await apiRequest('/relatorios', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    throw error;
  }
}

// Função para buscar relatório por ID
export async function getReport(id: string): Promise<Relatorio | null> {
  try {
    const response = await apiRequest(`/relatorios/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    return null;
  }
}

// Função para atualizar relatório
export async function updateReport(id: string, relatorio: Partial<Relatorio>): Promise<Relatorio> {
  try {
    const response = await apiRequest(`/relatorios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(relatorio),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error);
    throw error;
  }
}

// Função para gerar PDF
export async function generatePDF(id: string): Promise<Blob> {
  try {
    const response = await apiRequest(`/relatorios/${id}/pdf`, {
      method: 'POST',
    });
    
    return await response.blob();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}

// Funções de autenticação
export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao fazer login');
  }
  
  const data = await response.json();
  
  // Salvar token no localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token);
  }
  
  return data;
}

export async function register(email: string, password: string, name: string): Promise<{ user: any }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao registrar usuário');
  }
  
  return await response.json();
}

export async function logout(): Promise<void> {
  try {
    // Chamar endpoint de logout no backend
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao fazer logout no backend:', error);
  } finally {
    // Sempre remover o token do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
