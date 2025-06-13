/*
  Arquivo: src/components/Notification.js
  Descrição: Componente que representa uma única notificação (toast). Recebe a mensagem, o tipo (sucesso ou erro) e uma função para ser removida. Inclui um timer para auto-fechamento em caso de sucesso.
*/
import React, { useEffect, useState } from 'react';

const Notification = ({ message, type, onRemove }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const removeNotif = () => {
            setExiting(true);
            setTimeout(onRemove, 500); 
        };

        if (type === 'success') {
            const timer = setTimeout(removeNotif, 4000);
            return () => clearTimeout(timer);
        }
    }, [type, onRemove]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(onRemove, 500);
    };

    const iconName = type === 'success' ? 'check_circle' : 'error';
    const notificationClass = exiting ? 'notification fade-out' : 'notification';

    return (
        <div className={`${notificationClass} notification--${type}`}>
            <span className="material-icons notification__icon">{iconName}</span>
            <div className="notification__content">
                <p className="notification__message">{message}</p>
            </div>
            <button onClick={handleClose} className="notification__close">
                <span className="material-icons">close</span>
            </button>
        </div>
    );
};

export default Notification;