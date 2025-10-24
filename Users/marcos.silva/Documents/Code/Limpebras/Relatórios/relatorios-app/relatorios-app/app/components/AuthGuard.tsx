"use client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // Autenticação desabilitada - sempre renderizar children
  return <>{children}</>;
}
