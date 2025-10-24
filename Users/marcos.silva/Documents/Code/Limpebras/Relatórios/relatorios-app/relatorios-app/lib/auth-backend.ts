"use client";
import { useState, useEffect } from 'react';
import { authService } from './api-client';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface UserWithoutPassword {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserWithoutPassword | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

// Função para verificar se o usuário está autenticado
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    login: async () => false,
    logout: () => {},
    isAdmin: false
  });

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Inicializar o token no cliente API
      authService.initToken();
      
      // Verificar se o token ainda é válido fazendo uma requisição ao perfil
      authService.getProfile()
        .then(user => {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: {
              id: user.id,
              nome: user.nome,
              email: user.email,
              role: user.role,
              created_at: user.created_at
            },
            isLoading: false,
            isAdmin: user.role === 'admin'
          }));
        })
        .catch(error => {
          console.error('Token inválido:', error);
          // Token inválido, limpar dados
          localStorage.removeItem('auth_token');
          authService.clearToken();
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isAdmin: false
          }));
        });
    } else {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isAdmin: false
      }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      
      if (response.token && response.user) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: {
            id: response.user.id,
            nome: response.user.nome,
            email: response.user.email,
            role: response.user.role
          },
          isLoading: false,
          isAdmin: response.user.role === 'admin'
        }));
        
        console.log('Login successful, user authenticated:', response.user);
        return true;
      }
      
      console.log('Login failed - invalid response');
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      isLoading: false,
      isAdmin: false
    }));
  };

  return {
    ...authState,
    login,
    logout,
    isAdmin: authState.isAdmin
  };
}

// Função para gerenciar usuários (apenas para admins)
export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Aqui você implementaria uma função para listar usuários do backend
      // Por enquanto, vamos manter vazio
      setUsers([]);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async (userData: { email: string; password: string; nome: string; role: 'admin' | 'user' }) => {
    try {
      const response = await authService.register(userData);
      await loadUsers(); // Recarregar lista
      return response.user;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await authService.updateProfile(updates);
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Implementar delete no backend se necessário
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      // Implementar toggle status no backend se necessário
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refreshUsers: loadUsers
  };
}
