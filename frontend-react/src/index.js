/*
  Arquivo: src/index.js
  Descrição: Adicionado o novo FlashcardProvider para que toda a aplicação tenha acesso ao contexto dos flashcards.
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MapProvider } from './context/MapProvider';
import { FlashcardProvider } from './context/FlashcardProvider'; // Importa o novo provider

import 'reactflow/dist/style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <MapProvider>
          <FlashcardProvider> {/* Adiciona o provider na árvore de componentes */}
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </FlashcardProvider>
        </MapProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);