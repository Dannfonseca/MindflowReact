/*
  Arquivo: src/index.js
  Descrição: Ponto de entrada da aplicação React. Envolve a aplicação com os provedores de contexto e importa os estilos do React Flow.
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MapProvider } from './context/MapProvider';

import 'reactflow/dist/style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <MapProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </MapProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);