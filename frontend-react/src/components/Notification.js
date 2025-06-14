/*
  Arquivo: src/components/Notification.js
  Descrição: Componente para exibir uma única notificação.
*/
import React from 'react';
import './Notification.css';

const Notification = ({ message, type }) => {
    const icons = {
        info: 'info',
        success: 'check_circle',
        error: 'error',
    };

    return (
        <div className={`notification show ${type}`}>
            <span className="material-icons notification-icon">{icons[type] || 'info'}</span>
            <p>{message}</p>
        </div>
    );
};

export default Notification;