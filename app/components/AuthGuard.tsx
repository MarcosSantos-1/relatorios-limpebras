"use client";
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Usuário não autenticado tentando acessar rota protegida
        router.push('/login');
        return;
      }

      if (isAuthenticated && pathname === '/login') {
        // Usuário autenticado tentando acessar login - usar window.location para evitar conflitos
        setTimeout(() => {
          window.location.href = '/relatorios';
        }, 100);
        return;
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não é rota pública, não renderizar nada
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // Se está autenticado e está na página de login, não renderizar nada (será redirecionado)
  if (isAuthenticated && pathname === '/login') {
    return null;
  }

  return <>{children}</>;
}
