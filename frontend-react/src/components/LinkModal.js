/*
  Arquivo: src/components/LinkModal.js
  Descrição: Versão final e estável do modal de links, com lógica de salvamento e cancelamento explícita para evitar comportamentos inesperados.
*/
import React, { useState, useEffect } from 'react';
import './LinkModal.css';

const LinkModal = ({ isOpen, onClose, topic, onSave }) => {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (topic?.links) {
      setLinks([...topic.links]);
    }
  }, [topic]);

  if (!isOpen) {
    return null;
  }

  const handleAddLink = (e) => {
    e.preventDefault();
    if (title && url && links.length < 10) {
      setLinks([...links, { title, url }]);
      setTitle('');
      setUrl('');
    }
  };

  const handleRemoveLink = (indexToRemove) => {
    setLinks(links.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSaveAndClose = () => {
    onSave(topic.nodeId, topic.topicIndex, links);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-2">Links do Tópico</h2>
        <p className="secondary-text mb-4 truncate" title={topic.text}>{topic.text}</p>
        
        <div id="link-list" className="space-y-2 mb-4 pr-2 max-h-48 overflow-y-auto">
            {links.length > 0 ? links.map((link, index) => (
                 <div key={index} className="link-item">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.url}>{link.title}</a>
                    <button onClick={() => handleRemoveLink(index)} className="remove-link-btn" title="Remover link">
                        <span className="material-icons text-sm">delete</span>
                    </button>
                </div>
            )) : <p className="text-sm secondary-text text-center">Nenhum link adicionado.</p>
            }
        </div>
        
        {links.length < 10 && (
            <form onSubmit={handleAddLink} className="space-y-3">
                <p className="text-sm secondary-text text-right">Você pode adicionar mais {10 - links.length} link(s).</p>
                <div>
                    <label className="form-label">Título do Link</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Ex: Artigo sobre IA" className="form-input-settings" required />
                </div>
                <div>
                    <label className="form-label">URL</label>
                    <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://..." className="form-input-settings" required />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="modal-button-primary">Adicionar Link</button>
                </div>
            </form>
        )}
        
        <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="modal-button-secondary">Cancelar</button>
            <button type="button" onClick={handleSaveAndClose} className="modal-button-primary">Salvar e Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;