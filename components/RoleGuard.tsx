"use client";
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'host' | 'admin' | 'user';
  fallbackPath?: string;
}

export function RoleGuard({ 
  children, 
  requiredRole = 'user', 
  fallbackPath = '/relatorios' 
}: RoleGuardProps) {
  const { isAuthenticated, isHost, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      let hasAccess = false;

      switch (requiredRole) {
        case 'host':
          hasAccess = isHost;
          break;
        case 'admin':
          hasAccess = isHost || isAdmin;
          break;
        case 'user':
          hasAccess = true; // Todos os usuários autenticados têm acesso
          break;
      }

      if (!hasAccess) {
        router.push(fallbackPath);
      }
    }
  }, [isAuthenticated, isHost, isAdmin, isLoading, requiredRole, fallbackPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Verificar se tem acesso baseado no role
  let hasAccess = false;
  switch (requiredRole) {
    case 'host':
      hasAccess = isHost;
      break;
    case 'admin':
      hasAccess = isHost || isAdmin;
      break;
    case 'user':
      hasAccess = true;
      break;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
