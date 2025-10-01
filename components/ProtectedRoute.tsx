"use client";
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireHost?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireHost = false, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      if ((requireHost && !isAdmin) || (requireAdmin && !isAdmin)) {
        router.push('/relatorios');
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.push('/relatorios');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, requireHost, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if ((requireHost && !isAdmin) || (requireAdmin && !isAdmin)) {
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
            onClick={() => router.push('/relatorios')}
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
