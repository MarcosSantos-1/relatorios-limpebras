// Configuração da API do backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Classe para gerenciar requisições à API
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Definir token de autenticação
  setToken(token) {
    this.token = token;
  }

  // Remover token
  clearToken() {
    this.token = null;
  }

  // Fazer requisição HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let data;
      if (isJson) {
        data = await response.json();
      } else {
        data = await response.blob();
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Métodos HTTP
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Upload de arquivo
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Adicionar dados adicionais
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  // Upload múltiplo
  async uploadMultipleFiles(endpoint, files, additionalData = {}) {
    const formData = new FormData();
    
    // Adicionar arquivos
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Adicionar dados adicionais
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no upload múltiplo:', error);
      throw error;
    }
  }
}

// Instância global do cliente API
const apiClient = new ApiClient();

// Serviços específicos
export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      apiClient.setToken(response.token);
      // Salvar token no localStorage
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async register(userData) {
    return apiClient.post('/auth/register', userData);
  },

  async logout() {
    apiClient.clearToken();
    localStorage.removeItem('auth_token');
    return apiClient.post('/auth/logout');
  },

  async getProfile() {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(userData) {
    return apiClient.put('/auth/profile', userData);
  },

  async changePassword(passwordData) {
    return apiClient.put('/auth/change-password', passwordData);
  },

  // Inicializar token do localStorage
  initToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
    }
  }
};

export const relatoriosService = {
  async list(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get(`/relatorios${endpoint}`);
  },

  async getById(id) {
    return apiClient.get(`/relatorios/${id}`);
  },

  async create(relatorioData) {
    return apiClient.post('/relatorios', relatorioData);
  },

  async update(id, relatorioData) {
    return apiClient.put(`/relatorios/${id}`, relatorioData);
  },

  async delete(id) {
    return apiClient.delete(`/relatorios/${id}`);
  },

  async generatePDF(id) {
    return apiClient.post(`/relatorios/${id}/pdf`);
  },

  async downloadPDF(id, pdfId) {
    return apiClient.get(`/relatorios/${id}/pdf/${pdfId}`);
  }
};

export const uploadService = {
  async uploadSingle(file, relatorioId, metadata = {}) {
    return apiClient.uploadFile('/upload/single', file, {
      relatorio_id: relatorioId,
      ...metadata
    });
  },

  async uploadMultiple(files, relatorioId) {
    return apiClient.uploadMultipleFiles('/upload/multiple', files, {
      relatorio_id: relatorioId
    });
  },

  async listEvidencias(relatorioId) {
    return apiClient.get(`/upload/relatorio/${relatorioId}`);
  },

  async getEvidencia(id) {
    return apiClient.get(`/upload/${id}`);
  },

  async updateEvidencia(id, metadata) {
    return apiClient.put(`/upload/${id}`, metadata);
  },

  async deleteEvidencia(id) {
    return apiClient.delete(`/upload/${id}`);
  },

  async downloadEvidencia(id) {
    return apiClient.get(`/upload/${id}/download`);
  },

  async viewEvidencia(id) {
    return apiClient.get(`/upload/${id}/view`);
  }
};

export const pdfService = {
  async generatePDF(relatorioId, tipoGeracao = 'individual') {
    return apiClient.post('/pdf/generate', { relatorio_id: relatorioId, tipo_geracao: tipoGeracao });
  },

  async generateConsolidatedPDF(relatorioIds, tituloConsolidado) {
    return apiClient.post('/pdf/generate-consolidated', { 
      relatorio_ids: relatorioIds, 
      titulo_consolidado: tituloConsolidado 
    });
  },

  async listPDFs(relatorioId) {
    return apiClient.get(`/pdf/list/${relatorioId}`);
  },

  async downloadPDF(pdfId) {
    return apiClient.get(`/pdf/download/${pdfId}`);
  },

  async deletePDF(pdfId) {
    return apiClient.delete(`/pdf/${pdfId}`);
  }
};

// Hook para usar a API no React
export const useApi = () => {
  return {
    auth: authService,
    relatorios: relatoriosService,
    upload: uploadService,
    pdf: pdfService,
    client: apiClient
  };
};

export default apiClient;
