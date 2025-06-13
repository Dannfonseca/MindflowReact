/*
  Arquivo: src/context/NotificationContext.js
  Descrição: Gerencia o estado das notificações (toasts) de forma global através de um Contexto React. Fornece uma função `showNotification` que pode ser chamada de qualquer lugar da aplicação para exibir mensagens de sucesso ou erro.
*/
import React, { createContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Notification from '../components/Notification';

export const NotificationContext = createContext();

let nextId = 0;

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success') => {
        const id = nextId++;
        setNotifications((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const notificationContainer = document.getElementById('notification-container');

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notificationContainer && ReactDOM.createPortal(
                notifications.map((n) => (
                    <Notification
                        key={n.id}
                        message={n.message}
                        type={n.type}
                        onRemove={() => removeNotification(n.id)}
                    />
                )),
                notificationContainer
            )}
        </NotificationContext.Provider>
    );
};