/*
  Arquivo: src/pages/AdminPage.js
  Descrição: Página de administração para gerenciamento de usuários. Permite visualizar, buscar, criar, editar e deletar usuários. Utiliza modais para as ações de criação e edição.
*/
import React, { useState, useEffect, useMemo } from 'react';
import { fetchWithAuth, API_URL } from '../api';
import { useNotifications } from '../hooks/useNotifications';
import Modal from '../components/Modal';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { showNotification } = useNotifications();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users`);
            if (!res.ok) throw new Error('Falha ao carregar usuários');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => 
        users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase()) || 
                   user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   user.email.toLowerCase().includes(searchTerm.toLowerCase());
        }), [users, searchTerm]);
        
    const openEditModal = (user) => {
        setCurrentUser({ ...user });
        setEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/${currentUser._id}`, {
                method: 'PUT',
                body: JSON.stringify(currentUser)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || 'Falha ao atualizar usuário.');
            }
            showNotification('Usuário atualizado com sucesso!', 'success');
            setEditModalOpen(false);
            fetchUsers();
        } catch(err) {
            showNotification(err.message, 'error');
        }
    };
    
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || 'Falha ao deletar usuário');
            }
            showNotification('Usuário deletado com sucesso!', 'success');
            fetchUsers();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users`, {
                method: 'POST',
                body: JSON.stringify(currentUser)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Falha ao criar usuário.');
            showNotification('Usuário criado com sucesso!', 'success');
            setCreateModalOpen(false);
            fetchUsers();
        } catch(err) {
            showNotification(err.message, 'error');
        }
    }

    const UserTable = () => (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Nome</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Usuário</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Email</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Role</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-sm text-gray-700" data-label="Nome">{user.firstName} {user.lastName}</td>
                            <td className="p-3 text-sm text-gray-700" data-label="Usuário">{user.username}</td>
                            <td className="p-3 text-sm text-gray-700" data-label="Email">{user.email}</td>
                            <td className="p-3 text-sm text-gray-700" data-label="Role"><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                            <td className="p-3" data-label="Ações">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => openEditModal(user)} className="action-btn edit-btn">Editar</button>
                                    <button onClick={() => handleDeleteUser(user._id)} className="action-btn delete-btn">Deletar</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            <div className="p-6 sm:p-8 w-full bg-white rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold header-text">Gerenciamento de Usuários</h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar usuários..." className="form-input-settings w-full sm:w-80" />
                        <button onClick={() => { setCurrentUser({ role: 'user' }); setCreateModalOpen(true); }} className="button-primary font-semibold py-2.5 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-sm whitespace-nowrap">
                            <span className="material-icons text-sm mr-2">person_add</span>
                            Criar Usuário
                        </button>
                    </div>
                </div>
                {loading ? <p>Carregando...</p> : <UserTable />}
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Usuário">
                {currentUser && (
                    <form onSubmit={handleUpdateUser}>
                        <label className="flex flex-col mb-4">
                            <span className="form-label">Nome</span>
                            <input type="text" value={currentUser.firstName} onChange={e => setCurrentUser({...currentUser, firstName: e.target.value})} className="form-input-settings" />
                        </label>
                         <label className="flex flex-col mb-4">
                            <span className="form-label">Sobrenome</span>
                            <input type="text" value={currentUser.lastName} onChange={e => setCurrentUser({...currentUser, lastName: e.target.value})} className="form-input-settings" />
                        </label>
                         <label className="flex flex-col mb-4">
                            <span className="form-label">Usuário</span>
                            <input type="text" value={currentUser.username} onChange={e => setCurrentUser({...currentUser, username: e.target.value})} maxLength="20" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col mb-4">
                            <span className="form-label">Email</span>
                            <input type="email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="form-input-settings" />
                        </label>
                        <label className="flex flex-col mb-4">
                            <span className="form-label">Role</span>
                            <select value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})} className="form-input-settings">
                                <option value="user">User</option>
                                <option value="premium">Premium</option>
                                <option value="subadmin">Sub-Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setEditModalOpen(false)} className="modal-button-secondary">Cancelar</button>
                            <button type="submit" className="modal-button-primary">Salvar Alterações</button>
                        </div>
                    </form>
                )}
            </Modal>
            
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar Novo Usuário">
                {currentUser && (
                     <form onSubmit={handleCreateUser} className="space-y-3">
                         <div className="flex gap-4">
                            <label className="flex flex-col flex-1">
                                <span className="form-label">Nome</span>
                                <input required value={currentUser.firstName || ''} onChange={e => setCurrentUser({...currentUser, firstName: e.target.value})} type="text" placeholder="Nome do usuário" className="form-input-settings" />
                            </label>
                            <label className="flex flex-col flex-1">
                                <span className="form-label">Sobrenome</span>
                                <input required value={currentUser.lastName || ''} onChange={e => setCurrentUser({...currentUser, lastName: e.target.value})} type="text" placeholder="Sobrenome" className="form-input-settings" />
                            </label>
                        </div>
                        <label className="flex flex-col">
                            <span className="form-label">Usuário</span>
                            <input required value={currentUser.username || ''} onChange={e => setCurrentUser({...currentUser, username: e.target.value})} type="text" placeholder="Crie um nome de usuário" maxLength="20" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Data de Nascimento</span>
                            <input required value={currentUser.birthDate || ''} onChange={e => setCurrentUser({...currentUser, birthDate: e.target.value})} type="date" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Email</span>
                            <input required value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} type="email" placeholder="email@exemplo.com" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Senha</span>
                            <input required value={currentUser.password || ''} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} type="password" placeholder="Crie uma senha" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Role</span>
                            <select required value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})} className="form-input-settings">
                                <option value="user">User</option>
                                <option value="premium">Premium</option>
                                <option value="subadmin">Sub-Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={() => setCreateModalOpen(false)} className="modal-button-secondary">Cancelar</button>
                            <button type="submit" className="modal-button-primary">Criar Usuário</button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default AdminPage;