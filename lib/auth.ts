"use client";
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'host' | 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'host' | 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserWithoutPassword | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isHost: boolean;
  isAdmin: boolean;
}

// Usuário padrão (Host)
const DEFAULT_HOST: User = {
  id: 'host-001',
  name: 'Marcos Silva',
  email: 'marcos.silva@limpebras.com',
  username: 'marcos.silva',
  password: '2020',
  role: 'host',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Função para verificar se o usuário está autenticado
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    login: async () => false,
    logout: () => {},
    isHost: false,
    isAdmin: false
  });

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
          isHost: user.role === 'host',
          isAdmin: user.role === 'host' || user.role === 'admin'
        }));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          isHost: false,
          isAdmin: false
        }));
      }
    } else {
      // Primeira inicialização - usuário deve fazer login
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isHost: false,
        isAdmin: false
      }));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuários salvos
      const savedUsers = localStorage.getItem('users');
      let users: User[] = [];
      
      if (savedUsers) {
        users = JSON.parse(savedUsers);
      } else {
        // Se não há usuários salvos, inicializar com o host padrão
        users = [DEFAULT_HOST];
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Buscar usuário pelo username
      const user = users.find(u => u.username === username && u.isActive);
      
      if (user && user.password === password) {
        // Remover senha do objeto antes de salvar
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: userWithoutPassword,
          isLoading: false,
          isHost: user.role === 'host',
          isAdmin: user.role === 'host' || user.role === 'admin'
        }));
        
        console.log('Login successful, user authenticated:', userWithoutPassword);
        return true;
      }
      
      console.log('Login failed - user not found or password incorrect');
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      isLoading: false,
      isHost: false,
      isAdmin: false
    }));
  };

  return {
    ...authState,
    login,
    logout,
    isHost: authState.isHost,
    isAdmin: authState.isAdmin
  };
}

// Função para gerenciar usuários (apenas para hosts)
export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Carregar usuários salvos
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setUsers([DEFAULT_HOST]);
      }
    } else {
      // Inicializar com o usuário host
      setUsers([DEFAULT_HOST]);
      localStorage.setItem('users', JSON.stringify([DEFAULT_HOST]));
    }
  }, []);

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (id: string) => {
    // Não permitir deletar o host
    if (id === DEFAULT_HOST.id) {
      throw new Error('Não é possível deletar o usuário host');
    }
    
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const toggleUserStatus = (id: string) => {
    // Não permitir desativar o host
    if (id === DEFAULT_HOST.id) {
      throw new Error('Não é possível desativar o usuário host');
    }
    
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  };
}
