/*
  Arquivo: src/context/ThemeContext.js
  Descrição: Adicionados novos estados para nodeColor, fontColor e mapBgColor, com suas respectivas funções e persistência no localStorage, para permitir a personalização completa do tema.
*/
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
    const [nodeColor, setNodeColor] = useState(localStorage.getItem('nodeColor') || '#ffffff');
    const [fontColor, setFontColor] = useState(localStorage.getItem('fontColor') || '#1a202c');
    const [mapBgColor, setMapBgColor] = useState(localStorage.getItem('mapBgColor') || '#f3f4f6');

    useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('fontSize', fontSize); }, [fontSize]);
    useEffect(() => { localStorage.setItem('nodeColor', nodeColor); }, [nodeColor]);
    useEffect(() => { localStorage.setItem('fontColor', fontColor); }, [fontColor]);
    useEffect(() => { localStorage.setItem('mapBgColor', mapBgColor); }, [mapBgColor]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const value = { 
        theme, toggleTheme, 
        fontSize, setFontSize, 
        nodeColor, setNodeColor,
        fontColor, setFontColor,
        mapBgColor, setMapBgColor
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};