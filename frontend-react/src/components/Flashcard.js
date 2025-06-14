/*
  Arquivo: src/components/Flashcard.js
  Descrição: O estado interno foi removido. O componente agora é controlado pelo pai ('StudyPage'), tornando-o mais estável e previsível.
*/
import React from 'react';
import './Flashcard.css';

const Flashcard = ({ card, onDelete, isFlipped, onFlip }) => {

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(card._id, card.front);
    };

    return (
        <div className="flashcard-container" onClick={onFlip}>
            <div className={`flashcard-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="flashcard-face flashcard-face--front">
                    <div className="flashcard-header">
                        <span className="deck-title">Deck: {card.deck || 'Padrão'}</span>
                        <button onClick={handleDeleteClick} className="flashcard-delete-btn" title="Deletar este flashcard">
                            <span className="material-icons">delete</span>
                        </button>
                    </div>
                    <div className="flashcard-content">
                        <p>{card.front}</p>
                    </div>
                </div>
                <div className="flashcard-face flashcard-face--back">
                    <div className="flashcard-header">
                        <span className="deck-title">Resposta</span>
                        <button onClick={handleDeleteClick} className="flashcard-delete-btn" title="Deletar este flashcard">
                            <span className="material-icons">delete</span>
                        </button>
                    </div>
                    <div className="flashcard-content">
                        <p>{card.back}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;