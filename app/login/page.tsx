"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  // Carregar usuário salvo ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('savedUsername');
    if (saved) {
      setSavedUser(saved);
      setUsername(saved);
      setRememberUser(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        // Salvar usuário se marcado para lembrar
        if (rememberUser) {
          localStorage.setItem('savedUsername', username);
        } else {
          localStorage.removeItem('savedUsername');
        }
        
        toast.success('Login realizado com sucesso!');
        // Usar window.location para forçar o redirecionamento
        setTimeout(() => {
          window.location.href = '/relatorios';
        }, 1000);
      } else {
        toast.error('Usuário ou senha incorretos');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      setIsLoading(false);
    }
  };

  // Função para login rápido com usuário salvo
  const handleQuickLogin = async () => {
    if (!savedUser) return;
    
    setIsLoading(true);
    
    try {
      const success = await login(savedUser, '2020'); // Senha padrão para login rápido
      
      if (success) {
        toast.success('Login rápido realizado!');
        setTimeout(() => {
          window.location.href = '/relatorios';
        }, 1000);
      } else {
        toast.error('Erro no login rápido');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Erro no login rápido');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Relatórios Limpebras
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                placeholder="Digite sua senha"
                required
              />
            </div>
            
            {/* Checkbox Lembrar Usuário */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberUser"
                checked={rememberUser}
                onChange={(e) => setRememberUser(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="rememberUser" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                💾 Lembrar usuário
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Entrar
                </>
              )}
            </button>
            
            {/* Botão de Login Rápido */}
            {savedUser && (
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-slate-300 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ⚡ Login Rápido ({savedUser})
              </button>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          <p>Sistema de Relatórios - Limpebras</p>
          <p>© 2024 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}