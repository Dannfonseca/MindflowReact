/*
  Arquivo: src/components/ProtectedRoute.js
  Descrição: Componente de ordem superior (HOC) que protege rotas. Verifica se o usuário está autenticado e, opcionalmente, se possui permissão de administrador, redirecionando para o login ou dashboard caso não cumpra os requisitos.
*/
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const isAdminOrSubAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  if (adminOnly && !isAdminOrSubAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;