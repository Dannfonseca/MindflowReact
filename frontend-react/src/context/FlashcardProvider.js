/*
  Arquivo: src/context/FlashcardProvider.js
  Descrição: Implementada a função 'deleteFlashcard' e adicionada ao valor do contexto para permitir a exclusão de flashcards na página de estudo.
*/
import React, { createContext, useState, useContext, useCallback } from 'react';
import { API_URL, fetchWithAuth } from '../api';
import { useNotifications } from '../hooks/useNotifications';

const FlashcardContext = createContext();

export const useFlashcards = () => useContext(FlashcardContext);

export const FlashcardProvider = ({ children }) => {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotifications();

    const getFlashcardsByMap = useCallback(async (mapId) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/flashcards/map/${mapId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao buscar flashcards do mapa.');
            }
            const data = await response.json();
            setFlashcards(data);
        } catch (error) {
            showNotification(error.message, 'error');
            setFlashcards([]);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const createFlashcard = useCallback(async (flashcardData) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/flashcards`, {
                method: 'POST',
                body: JSON.stringify(flashcardData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar flashcard.');
            }

            const data = await response.json();
            setFlashcards(prev => [...prev, data]);
            return data;
        } catch (error) {
            showNotification(error.message, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const updateFlashcard = useCallback(async (id, updateData) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/flashcards/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar flashcard.');
            }

            const data = await response.json();
            setFlashcards(prev => prev.map(fc => (fc._id === id ? data : fc)));
            return data;
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const deleteFlashcard = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/flashcards/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao deletar flashcard.');
            }
            setFlashcards(prev => prev.filter(fc => fc._id !== id));
            showNotification('Flashcard deletado com sucesso.', 'success');
            return true;
        } catch (error) {
            showNotification(error.message, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }, [showNotification]);


    const value = {
        flashcards,
        loading,
        createFlashcard,
        getFlashcardsByMap,
        updateFlashcard,
        deleteFlashcard,
    };

    return (
        <FlashcardContext.Provider value={value}>
            {children}
        </FlashcardContext.Provider>
    );
};