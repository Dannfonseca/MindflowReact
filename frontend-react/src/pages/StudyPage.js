/*
  Arquivo: src/pages/StudyPage.js
  Descrição: A lógica de 'flip' foi restaurada. O estado 'isFlipped' e a função 'onFlip' foram adicionados para controlar a animação de virar do card.
*/
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFlashcards } from '../context/FlashcardProvider';
import Flashcard from '../components/Flashcard';

const StudyPage = () => {
    const { mapId } = useParams();
    const { flashcards, loading, getFlashcardsByMap, deleteFlashcard } = useFlashcards();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (mapId) {
            getFlashcardsByMap(mapId);
        }
    }, [mapId, getFlashcardsByMap]);

    const handleNavigation = useCallback((nextIndex) => {
        if (isFlipped) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(nextIndex);
            }, 150);
        } else {
            setCurrentIndex(nextIndex);
        }
    }, [isFlipped]);

    const handleNext = useCallback(() => {
        if (flashcards.length <= 1) return;
        const nextIndex = (currentIndex + 1) % flashcards.length;
        handleNavigation(nextIndex);
    }, [currentIndex, flashcards.length, handleNavigation]);
    
    const handlePrev = () => {
        if (flashcards.length <= 1) return;
        const prevIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
        handleNavigation(prevIndex);
    };

    const handleDelete = async (id, front) => {
        if (!window.confirm(`Tem certeza que deseja deletar o flashcard "${front}"?`)) return;
        
        const success = await deleteFlashcard(id);
        if (success && currentIndex >= flashcards.length - 1 && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    if (loading && flashcards.length === 0) {
        return <div className="study-page-container"><h2 className="loading-text">Carregando flashcards...</h2></div>;
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="study-page-container">
            <Link to={`/app/mindmap/${mapId}`} className="back-to-map-button-standalone">
                <span className="material-icons">arrow_back</span>
                Voltar ao Mapa
            </Link>
            
            <main className="study-main-content">
                {currentCard ? (
                    <>
                        <Flashcard
                            card={currentCard}
                            onDelete={handleDelete}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(f => !f)}
                        />
                        <div className="study-navigation">
                            <button onClick={handlePrev} className="nav-button" title="Anterior" disabled={flashcards.length <= 1}>
                                <span className="material-icons">chevron_left</span>
                            </button>
                            <span className="page-indicator">{currentIndex + 1} / {flashcards.length}</span>
                            <button onClick={handleNext} className="nav-button" title="Próximo" disabled={flashcards.length <= 1}>
                                <span className="material-icons">chevron_right</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-flashcards-message">
                        <p className="text-2xl font-bold">Nenhum flashcard para este mapa.</p>
                        <p>Volte e crie alguns para começar a estudar!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudyPage;