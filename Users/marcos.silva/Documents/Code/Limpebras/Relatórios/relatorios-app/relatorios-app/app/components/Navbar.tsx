"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-go";

export function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
  }, []);

  // Fechar menu do usuário quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    // Redirecionar para a página inicial após logout
    window.location.href = '/';
  };
  return (
    <header className="w-full border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className= "font-bold text-2xl text-purple-600 dark:text-purple-500"><span className="mr-2">👻</span> Relatórios - Limpebras</div>
        <ul className="flex items-center gap-4 text-sm font-bold">
          <li><Link href="/" className="hover:text-zinc-600 dark:hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4 font-bold text-purple-600 dark:text-purple-500" fill="none"  stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link></li>
          
          <li><Link href="/relatorios" className="hover:text-zinc-600 dark:hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Consultas
          </Link></li>
          
          {/* Dropdown Cadastro - Disponível para todos os usuários */}
          <li className="relative group">
            <button className="hover:text-zinc-600 font-bold dark:hover:text-white flex items-center gap-1">
              Cadastro
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <Link href="/relatorios/novo-registro" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Registros</Link>
                <Link href="/relatorios/novo" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Mutirão</Link>
                <Link href="/relatorios/novo-revitalizacao" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Revitalização</Link>
                <Link href="/relatorios/novo-rotineiros" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Serviços Rotineiros</Link>
                <Link href="/relatorios/novo-ecopontos" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Ecopontos</Link>
                <Link href="/relatorios/novo-dds" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">DDS</Link>
                <Link href="/relatorios/novo-eventos" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Eventos</Link>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                <Link href="/cadastros/eventos" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-purple-600 dark:text-purple-400 font-semibold">🎪 Eventos</Link>
                <Link href="/cadastro-usuarios" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-purple-600 dark:text-purple-400 font-semibold">👥 Usuários</Link>
              </div>
            </div>
          </li>

          {/* Dropdown Relatórios */}
          <li className="relative group">
            <button className="hover:text-zinc-600 dark:hover:text-white flex items-center gap-1">
              Relatórios
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <Link href="/relatorios/evidencias" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Evidências - Mutirões</Link>
                <Link href="/relatorios/evidencias-registros" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Evidências - Registros</Link>
                <Link href="/relatorios/evidencias-revitalizacoes" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Evidências - Revitaliza</Link>
                <Link href="/relatorios/evidencias-rotineiros" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">Evidências - Rotineiros</Link>
              </div>
            </div>
          </li>

          {/* Menu do Usuário */}
          <li className="relative user-menu-container">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                user?.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold">{user?.name || 'Usuário'}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                </div>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      user?.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{user?.nome || 'Usuário'}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email || 'email@exemplo.com'}</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        {user?.role === 'admin' ? '👑 Administrador' : '👤 Usuário'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link 
                    href="/cadastro-usuarios" 
                    className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-purple-600 dark:text-purple-400 font-semibold"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      👥 Gerenciar Usuários
                    </div>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      🚪 Sair
                    </div>
                  </button>
                </div>
              </div>
            )}
          </li>

          {/* Botão de Tema */}
          <li>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center"
              title="Alternar tema"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

