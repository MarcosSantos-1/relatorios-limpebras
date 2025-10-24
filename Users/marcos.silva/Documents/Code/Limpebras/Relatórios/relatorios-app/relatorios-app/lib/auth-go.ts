"use client";
import { useState, useEffect } from 'react';
import { login, logout, isAuthenticated } from './storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Por enquanto, assumir que o token é válido
      // Em uma implementação real, você validaria o token com o backend
      setIsAuthenticated(true);
      
      // Tentar obter dados do usuário do token (JWT decode básico)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.user_id || '',
          name: payload.name || 'Usuário',
          email: payload.email || '',
          role: payload.role || 'user'
        });
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    isAdmin: user?.role === 'admin'
  };
}
