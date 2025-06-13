/*
  Arquivo: src/pages/SettingsPage.js
  Descrição: Página de configurações. Permite ao usuário alterar o tema visual (claro/escuro), o tamanho da fonte e redefinir sua senha.
*/
import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { fetchWithAuth, API_URL } from '../api';

const SettingsPage = () => {
    const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
    const { showNotification } = useNotifications();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            showNotification('A nova senha e a confirmação não correspondem.', 'error');
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_URL}/user/change-password`, {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Não foi possível alterar a senha.');
            
            showNotification(data.msg, 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };
    
    return (
        <div id="view-settings" className="app-view active">
            <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold header-text mb-10">Configurações</h1>
                
                <div className="settings-section">
                    <h2 className="text-xl font-bold header-text mb-4">Geral</h2>
                    <div className="setting-item">
                        <label htmlFor="theme-toggle" className="setting-label">Modo Escuro</label>
                        <label className="toggle-switch">
                            <input type="checkbox" id="theme-toggle" checked={theme === 'dark'} onChange={toggleTheme} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="setting-item">
                        <label className="setting-label">Tamanho da Fonte</label>
                        <div className="font-size-options">
                            <button className={`font-size-btn ${fontSize === 'medium' ? 'active' : ''}`} onClick={() => setFontSize('medium')}>Médio</button>
                            <button className={`font-size-btn ${fontSize === 'large' ? 'active' : ''}`} onClick={() => setFontSize('large')}>Grande</button>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h2 className="text-xl font-bold header-text mt-8 mb-4">Segurança</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <label className="flex flex-col">
                            <p className="form-label">Senha Atual</p>
                            <input id="currentPassword" type="password" required value={passwordData.currentPassword} onChange={handlePasswordChange} className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <p className="form-label">Nova Senha</p>
                            <input id="newPassword" type="password" required value={passwordData.newPassword} onChange={handlePasswordChange} className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <p className="form-label">Confirmar Nova Senha</p>
                            <input id="confirmNewPassword" type="password" required value={passwordData.confirmNewPassword} onChange={handlePasswordChange} className="form-input-settings" />
                        </label>
                        <div className="pt-2">
                             <button type="submit" className="button-primary font-semibold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm">
                                Alterar Senha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;