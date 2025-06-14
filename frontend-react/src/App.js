/*
  Arquivo: src/App.js
  Descrição: Adicionada a nova rota /app/map/:mapId/study para a página de estudo de flashcards.
*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import MindmapPage from './pages/MindmapPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';
import PublicMapView from './pages/PublicMapView';
import StudyPage from './pages/StudyPage'; // Importa a nova página

function App() {
  const { theme, fontSize } = useTheme();

  return (
    <div className={`font-size-${fontSize} ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/view/:shareId" element={<PublicMapView />} />

          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mindmap" element={<MindmapPage />} />
            <Route path="mindmap/:mapId" element={<MindmapPage />} />
            <Route path="map/:mapId/study" element={<StudyPage />} /> {/* Adiciona a nova rota */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;