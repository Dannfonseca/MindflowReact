/*
  Arquivo: src/hooks/useNotifications.js
  Descrição: Hook customizado para acessar o contexto de notificações.
*/
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
    return useContext(NotificationContext);
};