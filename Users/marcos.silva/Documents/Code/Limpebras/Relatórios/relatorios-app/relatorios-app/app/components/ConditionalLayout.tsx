"use client";
import { usePathname } from 'next/navigation';
import { Navbar } from "./Navbar";
import { AuthGuard } from "./AuthGuard";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Páginas que não devem mostrar a navbar
  const hideNavbarPages = ['/login'];
  const shouldHideNavbar = hideNavbarPages.includes(pathname);

  return (
    <AuthGuard>
      {shouldHideNavbar ? (
        <>{children}</>
      ) : (
        <>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </>
      )}
    </AuthGuard>
  );
}
