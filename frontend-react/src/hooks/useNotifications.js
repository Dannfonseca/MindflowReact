/*
  Arquivo: src/hooks/useNotifications.js
  Descrição: Hook customizado para simplificar o acesso à função `showNotification` do `NotificationContext`. Permite que qualquer componente dispare uma notificação de forma concisa.
*/
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
};