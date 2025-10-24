"use client";
import { useState, useEffect } from 'react';
import { authService } from './api-client';

export interface User {
  id: string;
  nome: string;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'host';
  isActive?: boolean;
  created_at?: string;
}

export interface UserWithoutPassword {
  id: string;
  nome: string;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'host';
  created_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserWithoutPassword | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validar token e obter dados do usuário
      authService.getProfile()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token inválido, remover
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(username, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'host';

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    isAdmin
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

  const addUser = async (userData: { email: string; password: string; nome: string; role: 'admin' | 'user' | 'host'; isActive?: boolean }) => {
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