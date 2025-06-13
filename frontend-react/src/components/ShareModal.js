/*
  Arquivo: src/components/ShareModal.js
  Descrição: Modal de compartilhamento redesenhado com abas para convidar pessoas e para gerar link público.
*/
import React, { useState, useEffect } from 'react';
import './ShareModal.css';
import { useNotifications } from '../hooks/useNotifications';
import { useMapsAPI } from '../context/MapProvider';
import { useAuth } from '../hooks/useAuth';

const ShareModal = ({ isOpen, onClose, mapId }) => {
    const [activeTab, setActiveTab] = useState('invite');
    const [collaborators, setCollaborators] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    
    const { showNotification } = useNotifications();
    const { getCollaborators, inviteCollaborator, removeCollaborator, generateShareLink } = useMapsAPI();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (isOpen && mapId) {
            const fetchCollaborators = async () => {
                setIsLoading(true);
                const fetchedCollaborators = await getCollaborators(mapId);
                setCollaborators(fetchedCollaborators);
                setIsLoading(false);
            };
            fetchCollaborators();
        }
    }, [isOpen, mapId, getCollaborators]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const newCollaborator = await inviteCollaborator(mapId, email);
        if (newCollaborator) {
            setCollaborators([...collaborators, newCollaborator]);
            setEmail('');
        }
        setIsLoading(false);
    };

    const handleRemove = async (permissionId) => {
        const success = await removeCollaborator(permissionId);
        if (success) {
            setCollaborators(collaborators.filter(c => c._id !== permissionId));
        }
    };

    const handleGenerateLink = async () => {
        setIsLoading(true);
        const link = await generateShareLink(mapId);
        if (link) setShareLink(link);
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            showNotification('Link copiado!', 'success');
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Compartilhar e Gerenciar Acesso</h2>
                
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('invite')} className={`tab-button ${activeTab === 'invite' ? 'active' : ''}`}>Convidar Pessoas</button>
                        <button onClick={() => setActiveTab('link')} className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}>Link Público</button>
                    </nav>
                </div>

                {activeTab === 'invite' && (
                    <div>
                        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email do colaborador" className="form-input-settings flex-grow" required/>
                            <button type="submit" disabled={isLoading} className="modal-button-primary">Convidar</button>
                        </form>
                        <h3 className="font-semibold mb-2">Pessoas com Acesso</h3>
                        <div className="space-y-2">
                            <div className="collaborator-item">
                                <div>
                                    <p className="font-medium">{currentUser.firstName} {currentUser.lastName} (Você)</p>
                                    <p className="text-sm secondary-text">{currentUser.email}</p>
                                </div>
                                <span className="text-sm secondary-text font-medium">Proprietário</span>
                            </div>
                            {collaborators.map(c => (
                                <div key={c._id} className="collaborator-item">
                                    <div>
                                        <p className="font-medium">{c.user.firstName} {c.user.lastName}</p>
                                        <p className="text-sm secondary-text">{c.user.email}</p>
                                    </div>
                                    <button onClick={() => handleRemove(c._id)} className="remove-collaborator-btn" title="Remover acesso">
                                        <span className="material-icons">person_remove</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'link' && (
                     <div className="space-y-4">
                        <p className="secondary-text">Qualquer pessoa com este link poderá visualizar o mapa (não poderá editar).</p>
                        {shareLink ? (
                             <div className="flex items-center gap-2">
                                <input type="text" value={shareLink} readOnly className="form-input-settings flex-grow"/>
                                <button onClick={copyToClipboard} className="modal-button-primary" title="Copiar link"><span className="material-icons text-base">content_copy</span></button>
                            </div>
                        ) : (
                             <button onClick={handleGenerateLink} disabled={isLoading} className="modal-button-primary w-full">
                                {isLoading ? 'Gerando...' : 'Gerar Link de Visualização'}
                            </button>
                        )}
                    </div>
                )}
                
                <div className="flex justify-end pt-6">
                    <button type="button" onClick={onClose} className="modal-button-secondary">Concluído</button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;