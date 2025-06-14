/*
  Arquivo: src/components/FlashcardModal.js
  Descrição: Componente de modal para a criação de um novo flashcard a partir de um tópico do mapa mental.
*/
import React, { useState, useEffect } from 'react';
import './FlashcardModal.css';

const FlashcardModal = ({ isOpen, onClose, topic, mapId, onSubmit }) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    useEffect(() => {
        if (topic) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = topic.text;
            setFront(tempDiv.textContent || tempDiv.innerText || '');
            setBack('');
        }
    }, [topic]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!front.trim() || !back.trim()) {
            alert('Os campos "Frente" e "Verso" são obrigatórios.');
            return;
        }
        onSubmit({
            mapId,
            front,
            back,
            deck: 'Padrão'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content flashcard-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Criar Flashcard</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="flashcard-front">Frente</label>
                        <textarea
                            id="flashcard-front"
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            rows="3"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="flashcard-back">Verso</label>
                        <textarea
                            id="flashcard-back"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            rows="4"
                            placeholder="Digite a resposta ou o conteúdo do verso..."
                            autoFocus
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="button-primary">Salvar Flashcard</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlashcardModal;