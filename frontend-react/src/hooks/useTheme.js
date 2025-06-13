/*
  Arquivo: src/hooks/useTheme.js
  Descrição: Hook customizado para acessar o contexto de tema, provendo uma maneira fácil para os componentes lerem e modificarem o tema e o tamanho da fonte.
*/
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};