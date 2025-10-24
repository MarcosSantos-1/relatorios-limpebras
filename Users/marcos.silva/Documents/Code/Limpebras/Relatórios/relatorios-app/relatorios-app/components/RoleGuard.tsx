"use client";

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
  // Autenticação desabilitada - sempre renderizar children
  return <>{children}</>;
}