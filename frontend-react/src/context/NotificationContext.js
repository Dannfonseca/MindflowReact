/*
  Arquivo: src/context/NotificationContext.js
  Descrição: Corrigido o erro de compilação exportando a variável NotificationContext e removendo a definição duplicada do hook useNotifications.
*/
import React, { createContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';
import './NotificationContext.css';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showNotification = useCallback((message, type = 'info') => {
        const id = new Date().getTime();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            removeNotification(id);
        }, 3000);
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="notification-wrapper">
                {notifications.map(note => (
                    <Notification 
                        key={note.id} 
                        message={note.message} 
                        type={note.type}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};