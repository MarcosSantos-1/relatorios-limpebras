"use client";
import { useState } from 'react';
import { useUserManagement, User } from '@/lib/auth';
import { RoleGuard } from '@/components/RoleGuard';
import { toast } from 'react-toastify';

export default function UserRegistrationPage() {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useUserManagement();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as 'host' | 'admin' | 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingUser) {
        updateUser(editingUser.id, formData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        addUser({ ...formData, nome: formData.name, isActive: true });
        toast.success('Usuário criado com sucesso!');
      }
      
      setFormData({ name: '', email: '', username: '', password: '', role: 'user' });
      setEditingUser(null);
      setShowForm(false);
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.nome,
      email: user.email,
      username: user.username,
      password: '', // Não mostrar senha atual
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    if (user.role === 'host') {
      toast.error('Não é possível deletar o usuário host');
      return;
    }
    
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.nome}?`)) {
      try {
        deleteUser(user.id);
        toast.success('Usuário deletado com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar usuário');
      }
    }
  };

  const handleToggleStatus = (user: User) => {
    if (user.role === 'host') {
      toast.error('Não é possível desativar o usuário host');
      return;
    }
    
    try {
      toggleUserStatus(user.id);
      toast.success(`Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  return (
    <RoleGuard requiredRole="host">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">👥 Cadastro de Usuários</h1>
              <p className="text-blue-100">Gerencie usuários e permissões do sistema</p>
            </div>
          </div>
        </div>

        {/* Botão Adicionar Usuário */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingUser(null);
              setFormData({ name: '', email: '', username: '', password: '', role: 'user' });
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            ➕ Adicionar Usuário
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              {editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    placeholder="Digite o email"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Usuário
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    placeholder="Digite o nome de usuário"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    placeholder={editingUser ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
                    required={!editingUser}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'host' | 'admin' | 'user' })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                >
                  <option value="user">👤 Usuário</option>
                  <option value="admin">👑 Administrador</option>
                  <option value="host">🏆 Host (Super Admin)</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingUser ? '💾 Atualizar' : '💾 Salvar'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', username: '', password: '', role: 'user' });
                  }}
                  className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Usuários */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              📋 Usuários Cadastrados ({users.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          user.role === 'host' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}>
                           {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {user.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'host' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : user.role === 'admin'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role === 'host' ? '🏆 Host' : user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.isActive ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-600 dark:hover:bg-blue-500 text-blue-600 dark:text-white rounded-lg transition-colors duration-200"
                          title="Editar usuário"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {user.role !== 'host' && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                user.isActive 
                                  ? 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-yellow-600 dark:text-white'
                                  : 'bg-green-100 hover:bg-green-200 dark:bg-green-600 dark:hover:bg-green-500 text-green-600 dark:text-white'
                              }`}
                              title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                            >
                              {user.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-600 dark:hover:bg-red-500 text-red-600 dark:text-white rounded-lg transition-colors duration-200"
                              title="Deletar usuário"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
