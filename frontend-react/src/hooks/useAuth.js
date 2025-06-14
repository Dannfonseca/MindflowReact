/*
  Arquivo: src/hooks/useAuth.js
  Descrição: Hook customizado que simplifica o acesso aos dados e funções do `AuthContext`, como `user`, `isAuthenticated`, `login` e `logout`.
*/
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};